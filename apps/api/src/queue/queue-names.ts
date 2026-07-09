/**
 * apps/worker'daki kuyruk isimleriyle birebir aynı olmalı (bkz.
 * apps/worker/src/queues.ts) — iki ayrı process/paket olduğu için burada
 * ayrıca tanımlanıyor.
 */
export const QUEUE_NAMES = {
  invoiceCreate: "invoice-create",
  shipmentCreate: "shipment-create",
  whatsappSend: "whatsapp-send",
  whatsappInbound: "whatsapp-inbound",
} as const;
