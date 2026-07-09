export const QUEUE_NAMES = {
  invoiceCreate: "invoice-create",
  shipmentCreate: "shipment-create",
  whatsappSend: "whatsapp-send",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
