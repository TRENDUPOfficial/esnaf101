export const QUEUE_NAMES = {
  invoiceCreate: "invoice-create",
  shipmentCreate: "shipment-create",
  whatsappSend: "whatsapp-send",
  whatsappInbound: "whatsapp-inbound",
  subscriptionBilling: "subscription-billing",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
