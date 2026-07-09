import { Queue } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAMES } from "./queues";

export const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

/** Diğer worker servisleri (fatura/kargo) de müşteriye mesaj göndermek için bunu kullanır. */
export const sendQueue = new Queue(QUEUE_NAMES.whatsappSend, { connection });

export async function enqueueWhatsAppMessage(tenantId: string, to: string, body: string): Promise<void> {
  await sendQueue.add(QUEUE_NAMES.whatsappSend, { tenantId, to, body });
}
