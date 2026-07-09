import "dotenv/config";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAMES } from "./queues";
import { processInboundMessage } from "./whatsapp/conversation.service";
import type { WhatsAppInboundJobData } from "./whatsapp/conversation.service";
import { sendWhatsAppMessage } from "./whatsapp/send.service";
import type { WhatsAppSendJobData } from "./whatsapp/send.service";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const sendQueue = new Queue(QUEUE_NAMES.whatsappSend, { connection });

// Fatura kesme (Adım 5) ve kargo etiketi oluşturma (Adım 6) işleyicileri
// ilerleyen adımlarda buraya eklenecek.

const invoiceWorker = new Worker(
  QUEUE_NAMES.invoiceCreate,
  async (job) => {
    // eslint-disable-next-line no-console
    console.log(`[${QUEUE_NAMES.invoiceCreate}] job ${job.id} alındı`, job.data);
  },
  { connection },
);

const shipmentWorker = new Worker(
  QUEUE_NAMES.shipmentCreate,
  async (job) => {
    // eslint-disable-next-line no-console
    console.log(`[${QUEUE_NAMES.shipmentCreate}] job ${job.id} alındı`, job.data);
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

// eslint-disable-next-line no-console
console.log("esnaf101 worker başlatıldı");

process.on("SIGTERM", async () => {
  await Promise.all([
    invoiceWorker.close(),
    shipmentWorker.close(),
    whatsappSendWorker.close(),
    whatsappInboundWorker.close(),
    sendQueue.close(),
  ]);
  process.exit(0);
});
