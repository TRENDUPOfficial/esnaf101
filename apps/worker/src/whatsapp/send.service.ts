import { prisma } from "@esnaf101/db";
import { WhatsAppClient } from "@esnaf101/integrations-whatsapp";

export interface WhatsAppSendJobData {
  tenantId: string;
  to: string;
  body: string;
}

export async function sendWhatsAppMessage(data: WhatsAppSendJobData): Promise<void> {
  const { tenantId, to, body } = data;

  const integration = await prisma.tenantIntegration.findUnique({ where: { tenantId } });
  if (!integration?.whatsappPhoneNumberId) {
    throw new Error(`Tenant ${tenantId} için WhatsApp entegrasyonu tanımlı değil`);
  }

  const accessToken = integration.whatsappAccessToken ?? process.env.WHATSAPP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("WHATSAPP_ACCESS_TOKEN tanımlı değil");
  }

  const client = new WhatsAppClient({ phoneNumberId: integration.whatsappPhoneNumberId, accessToken });
  await client.sendTextMessage({ to, body });
}
