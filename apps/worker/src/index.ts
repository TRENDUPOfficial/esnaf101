import { Worker } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAMES } from "./queues";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Fatura kesme (Adım 5), kargo etiketi oluşturma (Adım 6) ve WhatsApp mesaj
// gönderimi (Adım 3) işleyicileri ilerleyen adımlarda buraya eklenecek.

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

const whatsappWorker = new Worker(
  QUEUE_NAMES.whatsappSend,
  async (job) => {
    // eslint-disable-next-line no-console
    console.log(`[${QUEUE_NAMES.whatsappSend}] job ${job.id} alındı`, job.data);
  },
  { connection },
);

// eslint-disable-next-line no-console
console.log("esnaf101 worker başlatıldı");

process.on("SIGTERM", async () => {
  await Promise.all([invoiceWorker.close(), shipmentWorker.close(), whatsappWorker.close()]);
  process.exit(0);
});
