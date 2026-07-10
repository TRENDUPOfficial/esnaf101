import { BadRequestException, Controller, Get, HttpCode, Inject, Post, Query, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request, Response } from "express";
import { Queue } from "bullmq";
import { PrismaClient } from "@esnaf101/db";
import { extractInboundEvents, verifyWebhookSignature, verifyWebhookSubscription } from "@esnaf101/integrations-whatsapp";
import type { WhatsAppInboundMessage, WhatsAppWebhookPayload } from "@esnaf101/integrations-whatsapp";
import { Public } from "../auth/public.decorator";
import { QUEUE_NAMES } from "../queue/queue-names";
import { WHATSAPP_INBOUND_QUEUE } from "../queue/queue.module";

// İmza doğrulaması zaten güvenliği sağlıyor — canlı yayın sırasında tüm
// tenant'lardan gelen mesajlar Meta'nın paylaşılan IP'lerinden aynı anda
// gönderilebilir, bu yüzden global limitten belirgin şekilde yüksek.
const WEBHOOK_THROTTLE = { default: { ttl: 60_000, limit: 1000 } };

export interface WhatsAppInboundJobData {
  tenantId: string;
  waId: string;
  message: WhatsAppInboundMessage;
}

/**
 * Meta WhatsApp Cloud API webhook alıcısı. Platform tek bir Meta App
 * üzerinden çalışır (Embedded Signup ile her tenant kendi numarasını
 * bağlar) — bu yüzden webhook URL'si tek ve tenant, gelen mesajdaki
 * `phone_number_id`den `tenant_integrations` tablosu üzerinden çözümlenir.
 *
 * Controller kasıtlı olarak ince tutuluyor: imzayı doğrular, tenant'ı
 * çözer ve gerçek işi (müşteri/konuşma durumu, medya indirme, sipariş
 * oluşturma) `whatsapp-inbound` kuyruğuna devredip hemen 200 döner — Meta
 * birkaç saniye içinde yanıt alamazsa webhook'u yeniden dener/askıya alır.
 */
@Throttle(WEBHOOK_THROTTLE)
@Controller("webhooks/whatsapp")
export class WhatsAppWebhookController {
  constructor(
    private readonly prisma: PrismaClient,
    @Inject(WHATSAPP_INBOUND_QUEUE) private readonly inboundQueue: Queue,
  ) {}

  @Public()
  @Get()
  verifySubscription(
    @Query("hub.mode") mode: string | undefined,
    @Query("hub.verify_token") verifyToken: string | undefined,
    @Query("hub.challenge") challenge: string | undefined,
    @Res() res: Response,
  ) {
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!expectedToken) {
      throw new Error("WHATSAPP_VERIFY_TOKEN tanımlı değil");
    }

    const result = verifyWebhookSubscription(
      { "hub.mode": mode, "hub.verify_token": verifyToken, "hub.challenge": challenge },
      expectedToken,
    );

    if (result === null) {
      res.status(403).send("Doğrulama başarısız");
      return;
    }
    res.status(200).send(result);
  }

  @Public()
  @Post()
  @HttpCode(200)
  async receive(@Req() req: RawBodyRequest<Request>) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) {
      throw new Error("WHATSAPP_APP_SECRET tanımlı değil");
    }
    if (!req.rawBody) {
      throw new BadRequestException("Boş istek gövdesi");
    }

    const signatureHeader = req.headers["x-hub-signature-256"];
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    if (!verifyWebhookSignature(req.rawBody, signature, appSecret)) {
      throw new BadRequestException("Webhook imzası doğrulanamadı");
    }

    const payload = JSON.parse(req.rawBody.toString("utf-8")) as WhatsAppWebhookPayload;
    const events = extractInboundEvents(payload);

    for (const event of events) {
      const integration = await this.prisma.tenantIntegration.findFirst({
        where: { whatsappPhoneNumberId: event.phoneNumberId },
      });
      if (!integration) {
        // Bilinmeyen/henüz bağlanmamış bir numaradan mesaj — sessizce atla.
        continue;
      }

      const job: WhatsAppInboundJobData = {
        tenantId: integration.tenantId,
        waId: event.waId,
        message: event.message,
      };
      await this.inboundQueue.add(QUEUE_NAMES.whatsappInbound, job);
    }

    return { received: true };
  }
}
