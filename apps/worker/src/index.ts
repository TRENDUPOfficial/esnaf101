import "dotenv/config";
import { Queue, Worker } from "bullmq";
import { connection, sendQueue } from "./queue-client";
import { QUEUE_NAMES } from "./queues";
import { processInboundMessage } from "./whatsapp/conversation.service";
import type { WhatsAppInboundJobData } from "./whatsapp/conversation.service";
import { sendWhatsAppMessage } from "./whatsapp/send.service";
import type { WhatsAppSendJobData } from "./whatsapp/send.service";
import { processInvoiceCreate } from "./invoicing/invoice.service";
import type { InvoiceCreateJobData } from "./invoicing/invoice.service";
import { processShipmentCreate } from "./shipping/shipment.service";
import type { ShipmentCreateJobData } from "./shipping/shipment.service";
import { processSubscriptionBilling } from "./billing/subscription-billing.service";

const invoiceWorker = new Worker(
  QUEUE_NAMES.invoiceCreate,
  async (job) => {
    await processInvoiceCreate(job.data as InvoiceCreateJobData);
  },
  { connection },
);

const shipmentWorker = new Worker(
  QUEUE_NAMES.shipmentCreate,
  async (job) => {
    await processShipmentCreate(job.data as ShipmentCreateJobData);
  },
  { connection },
);

const whatsappSendWorker = new Worker(
  QUEUE_NAMES.whatsappSend,
  async (job) => {
    await sendWhatsAppMessage(job.data as WhatsAppSendJobData);
  },
  { connection },
);

const whatsappInboundWorker = new Worker(
  QUEUE_NAMES.whatsappInbound,
  async (job) => {
    const reply = await processInboundMessage(job.data as WhatsAppInboundJobData);
    if (reply) {
      const { tenantId, waId } = job.data as WhatsAppInboundJobData;
      await sendQueue.add(QUEUE_NAMES.whatsappSend, { tenantId, to: waId, body: reply } satisfies WhatsAppSendJobData);
    }
  },
  { connection },
);

const subscriptionBillingQueue = new Queue(QUEUE_NAMES.subscriptionBilling, { connection });
const subscriptionBillingWorker = new Worker(
  QUEUE_NAMES.subscriptionBilling,
  async () => {
    await processSubscriptionBilling();
  },
  { connection },
);

// Her gün 03:00'te süresi dolan abonelikler için otomatik tahsilat dener
// (bkz. PLANNING.md Adım 9). Aynı repeatable job'ın birden fazla worker
// kopyasında tekrar tekrar eklenmemesi için BullMQ'nun job id'si sabit.
void subscriptionBillingQueue.add(
  "daily-check",
  {},
  { repeat: { pattern: "0 3 * * *" }, jobId: "subscription-billing-daily" },
);

// eslint-disable-next-line no-console
console.log("esnaf101 worker başlatıldı");

process.on("SIGTERM", async () => {
  await Promise.all([
    invoiceWorker.close(),
    shipmentWorker.close(),
    whatsappSendWorker.close(),
    whatsappInboundWorker.close(),
    subscriptionBillingWorker.close(),
    subscriptionBillingQueue.close(),
    sendQueue.close(),
  ]);
  process.exit(0);
});
