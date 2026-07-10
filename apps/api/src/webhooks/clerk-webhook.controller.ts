import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Webhook } from "svix";
import { PrismaClient } from "@esnaf101/db";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../auth/public.decorator";

// İmza doğrulaması zaten güvenliği sağlıyor — burada asıl amaç Clerk'in
// paylaşılan gönderici IP'lerinden gelen meşru trafiğin genel limite takılıp
// başka tenant'ları etkilememesi.
const WEBHOOK_THROTTLE = { default: { ttl: 60_000, limit: 300 } };

interface ClerkWebhookEvent {
  type: string;
  data: unknown;
}

interface ClerkOrganizationData {
  id: string;
  name: string;
  slug: string;
}

/**
 * Clerk, bir kullanıcı onboarding sırasında yeni bir organizasyon
 * oluşturduğunda bu webhook'u tetikler. Tenant kaydını burada oluşturuyoruz
 * (durum: pending_onboarding) — panel tarafındaki onboarding formu daha sonra
 * stok takibi tercihini ve IBAN bilgisini tamamlayıp tenant'ı `active`e alır.
 */
@Controller("webhooks/clerk")
export class ClerkWebhookController {
  constructor(private readonly prisma: PrismaClient) {}

  @Public()
  @Throttle(WEBHOOK_THROTTLE)
  @Post()
  @HttpCode(200)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers("svix-id") svixId?: string,
    @Headers("svix-timestamp") svixTimestamp?: string,
    @Headers("svix-signature") svixSignature?: string,
  ) {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!signingSecret) {
      throw new Error("CLERK_WEBHOOK_SIGNING_SECRET tanımlı değil");
    }
    if (!req.rawBody || !svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException("Eksik webhook imza header'ları");
    }

    let event: ClerkWebhookEvent;
    try {
      event = new Webhook(signingSecret).verify(req.rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      throw new BadRequestException("Webhook imzası doğrulanamadı");
    }

    if (event.type === "organization.created") {
      const { id, name, slug } = event.data as ClerkOrganizationData;
      await this.prisma.tenant.upsert({
        where: { clerkOrgId: id },
        update: {},
        create: {
          clerkOrgId: id,
          name,
          slug,
          status: "pending_onboarding",
        },
      });
    }

    return { received: true };
  }
}
