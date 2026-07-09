import { Global, Module } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAMES } from "./queue-names";

export const WHATSAPP_INBOUND_QUEUE = "WHATSAPP_INBOUND_QUEUE";
export const INVOICE_CREATE_QUEUE = "INVOICE_CREATE_QUEUE";
export const SHIPMENT_CREATE_QUEUE = "SHIPMENT_CREATE_QUEUE";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

/**
 * apps/api'nin BullMQ kuyruk producer'ı — webhook/controller handler'ları
 * burada iş ekleyip hemen döner, gerçek işleme apps/worker'da asenkron
 * yapılır (bkz. PLANNING.md "Arka plan işleri" mimari kararı).
 */
@Global()
@Module({
  providers: [
    { provide: WHATSAPP_INBOUND_QUEUE, useValue: new Queue(QUEUE_NAMES.whatsappInbound, { connection }) },
    { provide: INVOICE_CREATE_QUEUE, useValue: new Queue(QUEUE_NAMES.invoiceCreate, { connection }) },
    { provide: SHIPMENT_CREATE_QUEUE, useValue: new Queue(QUEUE_NAMES.shipmentCreate, { connection }) },
  ],
  exports: [WHATSAPP_INBOUND_QUEUE, INVOICE_CREATE_QUEUE, SHIPMENT_CREATE_QUEUE],
})
export class QueueModule {}
