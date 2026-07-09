import { Prisma, prisma } from "@esnaf101/db";
import { WhatsAppClient } from "@esnaf101/integrations-whatsapp";
import type { WhatsAppInboundImageMessage, WhatsAppInboundMessage, WhatsAppInboundTextMessage } from "@esnaf101/integrations-whatsapp";
import { createObjectStorageFromEnv } from "@esnaf101/integrations-storage";

export interface WhatsAppInboundJobData {
  tenantId: string;
  waId: string;
  message: WhatsAppInboundMessage;
}

const storage = createObjectStorageFromEnv();

/**
 * WhatsApp bot'unun konuşma durum makinesi (bkz. PLANNING.md Adım 3):
 *  - Telefon numarasından (wa_id) müşteri tanınır; ad-soyad/adres zaten
 *    kayıtlıysa tekrar sorulmaz.
 *  - Ekran görüntüsü (image mesajı) obje depolamaya yüklenir.
 *  - Yeni müşteriden ad-soyad + açık adres toplanır (conversation_states.step).
 *  - Bilgiler tamamlanınca sipariş kaydı oluşturulur (durum: fiyat bekliyor).
 *
 * Dönen string, müşteriye gönderilecek yanıt metnidir (çağıran taraf
 * `whatsapp-send` kuyruğuna ekler) — bu fonksiyon WhatsApp API'sini
 * doğrudan çağırmaz, sadece iş kurallarını uygular.
 */
export async function processInboundMessage(data: WhatsAppInboundJobData): Promise<string | null> {
  const { tenantId, waId, message } = data;

  const customer = await prisma.customer.upsert({
    where: { tenantId_waId: { tenantId, waId } },
    update: {},
    create: { tenantId, waId },
  });

  const state = await prisma.conversationState.upsert({
    where: { tenantId_customerId: { tenantId, customerId: customer.id } },
    update: {},
    create: { tenantId, customerId: customer.id, step: "awaiting_screenshot" },
  });

  // Not: WhatsAppInboundMessage, Meta'nın modellemediğimiz mesaj tipleri için
  // `type: string` genel bir varyant içeriyor — bu yüzden `===` ile daralan
  // union yerine açık cast kullanıyoruz (Clerk webhook'unda karşılaşılan aynı
  // TS daraltma sorunu, bkz. clerk-webhook.controller.ts).
  if (message.type === "image") {
    return handleImageMessage({ tenantId, customer, message: message as WhatsAppInboundImageMessage });
  }

  if (message.type === "text") {
    return handleTextMessage({ tenantId, customer, state, text: (message as WhatsAppInboundTextMessage).text.body });
  }

  return "Şu an sadece metin ve ürün ekran görüntüsü mesajlarını işleyebiliyorum. Lütfen ürünün ekran görüntüsünü gönderin.";
}

async function handleImageMessage(params: {
  tenantId: string;
  customer: { id: string; fullName: string | null; address: string | null };
  message: WhatsAppInboundImageMessage;
}): Promise<string> {
  const { tenantId, customer, message } = params;

  const integration = await prisma.tenantIntegration.findUnique({ where: { tenantId } });
  if (!integration?.whatsappPhoneNumberId) {
    throw new Error(`Tenant ${tenantId} için WhatsApp entegrasyonu tanımlı değil`);
  }
  const client = new WhatsAppClient({
    phoneNumberId: integration.whatsappPhoneNumberId,
    accessToken: integration.whatsappAccessToken ?? requireEnv("WHATSAPP_ACCESS_TOKEN"),
  });

  const { buffer, mimeType } = await client.downloadMedia(message.image.id);
  const extension = mimeType.split("/")[1] ?? "jpg";
  const key = `${tenantId}/${customer.id}/${Date.now()}.${extension}`;
  const { url } = await storage.upload({ key, buffer, contentType: mimeType });

  const isKnownCustomer = Boolean(customer.fullName && customer.address);

  if (isKnownCustomer) {
    await prisma.order.create({
      data: {
        tenantId,
        customerId: customer.id,
        screenshotUrl: url,
        rawDescription: message.image.caption,
        status: "awaiting_product_price",
      },
    });
    await prisma.conversationState.update({
      where: { tenantId_customerId: { tenantId, customerId: customer.id } },
      data: { step: "done", context: Prisma.DbNull },
    });
    return "Siparişiniz alındı! Fiyat belirlenince tarafınıza bilgi vereceğiz.";
  }

  await prisma.conversationState.update({
    where: { tenantId_customerId: { tenantId, customerId: customer.id } },
    data: { step: "awaiting_name", context: { pendingScreenshotUrl: url, pendingCaption: message.image.caption ?? null } },
  });
  return "Teşekkürler! Siparişi tamamlamak için önce ad-soyadınızı öğrenebilir miyim?";
}

async function handleTextMessage(params: {
  tenantId: string;
  customer: { id: string; fullName: string | null; address: string | null };
  state: { step: string; context: unknown };
  text: string;
}): Promise<string> {
  const { tenantId, customer, state, text } = params;

  if (state.step === "awaiting_name") {
    await prisma.customer.update({ where: { id: customer.id }, data: { fullName: text.trim() } });
    await prisma.conversationState.update({
      where: { tenantId_customerId: { tenantId, customerId: customer.id } },
      data: { step: "awaiting_address" },
    });
    return "Teşekkürler! Şimdi de açık teslimat adresinizi yazar mısınız?";
  }

  if (state.step === "awaiting_address") {
    const context = state.context as { pendingScreenshotUrl?: string; pendingCaption?: string | null } | null;
    if (!context?.pendingScreenshotUrl) {
      await prisma.conversationState.update({
        where: { tenantId_customerId: { tenantId, customerId: customer.id } },
        data: { step: "awaiting_screenshot" },
      });
      return "Bir aksaklık oldu, lütfen ürünün ekran görüntüsünü tekrar gönderir misiniz?";
    }

    await prisma.$transaction([
      prisma.customer.update({ where: { id: customer.id }, data: { address: text.trim() } }),
      prisma.order.create({
        data: {
          tenantId,
          customerId: customer.id,
          screenshotUrl: context.pendingScreenshotUrl,
          rawDescription: context.pendingCaption ?? undefined,
          status: "awaiting_product_price",
        },
      }),
      prisma.conversationState.update({
        where: { tenantId_customerId: { tenantId, customerId: customer.id } },
        data: { step: "done", context: Prisma.DbNull },
      }),
    ]);
    return "Adresiniz kaydedildi, siparişiniz alındı! Fiyat belirlenince tarafınıza bilgi vereceğiz.";
  }

  return "Sipariş vermek için lütfen ürünün ekran görüntüsünü gönderin.";
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} tanımlı değil`);
  return value;
}
