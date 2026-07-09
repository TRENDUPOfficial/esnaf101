import { createHmac, timingSafeEqual } from "node:crypto";

export interface WhatsAppClientConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
}

export interface SendTextMessageParams {
  to: string;
  body: string;
}

/**
 * Meta WhatsApp Cloud API için ince istemci. Her tenant kendi
 * phoneNumberId/accessToken çiftiyle bir örnek oluşturur
 * (bkz. tenant_integrations tablosu).
 */
export class WhatsAppClient {
  private readonly baseUrl: string;

  constructor(private readonly config: WhatsAppClientConfig) {
    const version = config.apiVersion ?? "v20.0";
    this.baseUrl = `https://graph.facebook.com/${version}/${config.phoneNumberId}`;
  }

  async sendTextMessage({ to, body }: SendTextMessageParams): Promise<void> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    });

    if (!res.ok) {
      throw new Error(`WhatsApp mesaj gönderimi başarısız: ${res.status} ${await res.text()}`);
    }
  }

  /**
   * Meta Media API'den bir medyanın (ör. ekran görüntüsü) geçici indirme
   * URL'sini alır. Dönen URL birkaç dakika içinde geçersiz olur; hemen
   * ardından `downloadMedia` ile indirilmelidir.
   */
  async getMediaUrl(mediaId: string): Promise<{ url: string; mimeType: string }> {
    const graphRoot = this.baseUrl.slice(0, this.baseUrl.lastIndexOf("/"));
    const res = await fetch(`${graphRoot}/${mediaId}`, {
      headers: { Authorization: `Bearer ${this.config.accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`WhatsApp medya URL'si alınamadı: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { url: string; mime_type: string };
    return { url: data.url, mimeType: data.mime_type };
  }

  /**
   * Bir medyayı (ör. müşterinin gönderdiği ekran görüntüsü) baytlar olarak
   * indirir. `getMediaUrl` + asıl indirme isteğini tek adımda birleştirir.
   */
  async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const { url, mimeType } = await this.getMediaUrl(mediaId);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.config.accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`WhatsApp medya indirilemedi: ${res.status} ${await res.text()}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, mimeType };
  }
}

// ---------------------------------------------------------------------------
// Gelen webhook payload tipleri ve ayrıştırma yardımcıları
// ---------------------------------------------------------------------------

export interface WhatsAppInboundTextMessage {
  type: "text";
  id: string;
  from: string;
  timestamp: string;
  text: { body: string };
}

export interface WhatsAppInboundImageMessage {
  type: "image";
  id: string;
  from: string;
  timestamp: string;
  image: { id: string; mime_type: string; caption?: string };
}

export type WhatsAppInboundMessage =
  | WhatsAppInboundTextMessage
  | WhatsAppInboundImageMessage
  | { type: string; id: string; from: string; timestamp: string };

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        metadata: { phone_number_id: string; display_phone_number: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: WhatsAppInboundMessage[];
      };
    }>;
  }>;
}

export interface ParsedInboundEvent {
  phoneNumberId: string;
  waId: string;
  contactName?: string;
  message: WhatsAppInboundMessage;
}

/**
 * Meta webhook payload'ını, her biri tek bir gelen mesajı temsil eden düz
 * bir listeye çevirir (bir payload birden fazla entry/change/message
 * içerebilir).
 */
export function extractInboundEvents(payload: WhatsAppWebhookPayload): ParsedInboundEvent[] {
  const events: ParsedInboundEvent[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const { metadata, contacts, messages } = change.value;
      for (const message of messages ?? []) {
        const contact = contacts?.find((c) => c.wa_id === message.from);
        events.push({
          phoneNumberId: metadata.phone_number_id,
          waId: message.from,
          contactName: contact?.profile.name,
          message,
        });
      }
    }
  }
  return events;
}

/**
 * Meta webhook doğrulama (GET /webhook?hub.verify_token=...).
 */
export function verifyWebhookSubscription(
  query: Record<string, string | undefined>,
  verifyToken: string,
): string | null {
  if (query["hub.mode"] === "subscribe" && query["hub.verify_token"] === verifyToken) {
    return query["hub.challenge"] ?? null;
  }
  return null;
}

/**
 * Gelen webhook payload'ının Meta App Secret ile imzalandığını doğrular
 * (X-Hub-Signature-256 header'ı).
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;

  return timingSafeEqual(expectedBuf, providedBuf);
}
