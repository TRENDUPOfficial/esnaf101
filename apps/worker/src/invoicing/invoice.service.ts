import { prisma } from "@esnaf101/db";
import { decryptJson } from "@esnaf101/crypto";
import { ParasutInvoiceProvider } from "@esnaf101/integrations-invoicing";
import type { InvoiceProvider } from "@esnaf101/integrations-invoicing";
import { enqueueWhatsAppMessage } from "../queue-client";

export interface InvoiceCreateJobData {
  tenantId: string;
  orderId: string;
}

/**
 * Adım 5: personel fiyatı onayladıktan sonra (order.status=awaiting_invoice)
 * tetiklenir. Fatura kesilince müşteriye IBAN/ödeme talimatı WhatsApp'tan
 * otomatik gönderilir ve sipariş ödeme bekler duruma geçer.
 *
 * İki aşama da idempotent tasarlandı — BullMQ bir job'ı retry ederse
 * (ör. WhatsApp gönderimi başarısız olduysa) zaten kesilmiş bir fatura
 * tekrar oluşturulmaz.
 */
export async function processInvoiceCreate(data: InvoiceCreateJobData): Promise<void> {
  const { tenantId, orderId } = data;

  let order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { customer: true, product: true },
  });

  if (order.status === "awaiting_invoice") {
    try {
      const provider = await buildInvoiceProvider(tenantId);
      const result = await provider.createInvoice({
        customerFullName: order.customer.fullName ?? "Müşteri",
        customerAddress: order.customer.address ?? "",
        items: [
          {
            name: order.product?.name ?? order.rawDescription ?? "Ürün",
            quantity: 1,
            unitPrice: Number(order.price ?? 0),
          },
        ],
      });

      const integration = await prisma.tenantIntegration.findUniqueOrThrow({ where: { tenantId } });
      await prisma.$transaction([
        prisma.invoice.create({
          data: { orderId, provider: integration.invoiceProvider!, externalRef: result.externalRef },
        }),
        prisma.order.update({ where: { id: orderId }, data: { status: "invoiced", lastErrorMessage: null } }),
      ]);
    } catch (err) {
      await prisma.order.update({ where: { id: orderId }, data: { lastErrorMessage: toMessage(err) } });
      throw err;
    }
  }

  order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { customer: true, product: true } });
  if (order.status === "invoiced") {
    const settings = await prisma.tenantSettings.findUnique({ where: { tenantId } });
    await enqueueWhatsAppMessage(tenantId, order.customer.waId, buildIbanMessage(settings, order.price));
    await prisma.order.update({ where: { id: orderId }, data: { status: "awaiting_payment" } });
  }
}

interface ParasutCredentials {
  clientId: string;
  clientSecret: string;
  companyId: string;
  accessToken: string;
}

async function buildInvoiceProvider(tenantId: string): Promise<InvoiceProvider> {
  const integration = await prisma.tenantIntegration.findUnique({ where: { tenantId } });
  if (!integration?.invoiceProvider || !integration.invoiceCredentials) {
    throw new Error(`Tenant ${tenantId} için fatura entegrasyonu tanımlı değil`);
  }

  switch (integration.invoiceProvider) {
    case "parasut": {
      const creds = decryptJson<ParasutCredentials>(integration.invoiceCredentials);
      return new ParasutInvoiceProvider(creds);
    }
    default:
      throw new Error(`Desteklenmeyen fatura sağlayıcısı: ${integration.invoiceProvider}`);
  }
}

function buildIbanMessage(settings: { iban: string | null; ibanAccountHolder: string | null } | null, price: unknown): string {
  if (!settings?.iban) {
    return "Faturanız kesildi. Ödeme bilgileri için lütfen bizimle iletişime geçin.";
  }
  return [
    "Faturanız kesildi! Ödeme için:",
    `IBAN: ${settings.iban}`,
    settings.ibanAccountHolder ? `Alıcı: ${settings.ibanAccountHolder}` : undefined,
    `Tutar: ${price} TL`,
    "Ödemenizi yaptıktan sonra ürününüz kargoya verilecektir.",
  ]
    .filter(Boolean)
    .join("\n");
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
