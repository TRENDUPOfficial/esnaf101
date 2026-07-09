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
