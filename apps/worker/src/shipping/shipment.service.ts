import { prisma } from "@esnaf101/db";
import { decryptJson } from "@esnaf101/crypto";
import { ShipentegraShippingProvider } from "@esnaf101/integrations-shipping";
import type { ShippingProvider } from "@esnaf101/integrations-shipping";
import { enqueueWhatsAppMessage } from "../queue-client";

export interface ShipmentCreateJobData {
  tenantId: string;
  orderId: string;
}

/**
 * Adım 6: personel ödemenin geldiğini işaretledikten sonra (order.status=paid)
 * tetiklenir. Kargo etiketi oluşturulunca takip numarası WhatsApp'tan
 * otomatik bildirilir ve sipariş kargolandı durumuna geçer.
 */
export async function processShipmentCreate(data: ShipmentCreateJobData): Promise<void> {
  const { tenantId, orderId } = data;

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { customer: true } });
  if (order.status !== "paid") return; // zaten işlenmiş / tekrar denenen job

  try {
    const provider = await buildShippingProvider(tenantId);
    const result = await provider.createShipment({
      orderRef: order.id,
      recipientFullName: order.customer.fullName ?? "Müşteri",
      recipientAddress: order.customer.address ?? "",
    });

    await prisma.$transaction([
      prisma.shipment.create({
        data: {
          orderId,
          carrier: result.carrier,
          trackingNumber: result.trackingNumber,
          labelUrl: result.labelUrl,
        },
      }),
      prisma.order.update({ where: { id: orderId }, data: { status: "shipped", lastErrorMessage: null } }),
    ]);

    await enqueueWhatsAppMessage(
      tenantId,
      order.customer.waId,
      `Siparişiniz kargoya verildi! Kargo firması: ${result.carrier}, takip no: ${result.trackingNumber}`,
    );
  } catch (err) {
    await prisma.order.update({ where: { id: orderId }, data: { lastErrorMessage: toMessage(err) } });
    throw err;
  }
}

interface ShipentegraCredentials {
  apiKey: string;
  apiSecret: string;
}

async function buildShippingProvider(tenantId: string): Promise<ShippingProvider> {
  const integration = await prisma.tenantIntegration.findUnique({ where: { tenantId } });
  if (!integration?.shippingProvider || !integration.shippingCredentials) {
    throw new Error(`Tenant ${tenantId} için kargo entegrasyonu tanımlı değil`);
  }

  switch (integration.shippingProvider) {
    case "shipentegra": {
      const creds = decryptJson<ShipentegraCredentials>(integration.shippingCredentials);
      return new ShipentegraShippingProvider(creds);
    }
    default:
      throw new Error(`Desteklenmeyen kargo sağlayıcısı: ${integration.shippingProvider}`);
  }
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
