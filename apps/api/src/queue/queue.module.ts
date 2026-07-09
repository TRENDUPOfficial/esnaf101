import { Global, Module } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAMES } from "./queue-names";

export const WHATSAPP_INBOUND_QUEUE = "WHATSAPP_INBOUND_QUEUE";

/**
 * apps/api'nin BullMQ kuyruk producer'ı — webhook handler'lar burada iş
 * ekleyip hemen döner, gerçek işleme apps/worker'da asenkron yapılır
 * (bkz. PLANNING.md "Arka plan işleri" mimari kararı).
 */
@Global()
@Module({
  providers: [
    {
      provide: WHATSAPP_INBOUND_QUEUE,
      useFactory: () => {
        const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
          maxRetriesPerRequest: null,
        });
        return new Queue(QUEUE_NAMES.whatsappInbound, { connection });
      },
    },
  ],
  exports: [WHATSAPP_INBOUND_QUEUE],
})
export class QueueModule {}
