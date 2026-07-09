import { Injectable } from "@nestjs/common";
import { PrismaClient, Tenant } from "@esnaf101/db";
import { encryptJson, encryptSecret } from "@esnaf101/crypto";
import { UpdateIntegrationsDto } from "./dto/update-integrations.dto";

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getMe(tenant: Tenant) {
    const integration = await this.prisma.tenantIntegration.findUnique({ where: { tenantId: tenant.id } });
    return {
      whatsappPhoneNumberId: integration?.whatsappPhoneNumberId ?? null,
      whatsappAccessTokenConfigured: Boolean(integration?.whatsappAccessToken),
      invoiceProvider: integration?.invoiceProvider ?? null,
      invoiceCredentialsConfigured: Boolean(integration?.invoiceCredentials),
      shippingProvider: integration?.shippingProvider ?? null,
      shippingCredentialsConfigured: Boolean(integration?.shippingCredentials),
    };
  }

  async updateMe(tenant: Tenant, dto: UpdateIntegrationsDto) {
    await this.prisma.tenantIntegration.upsert({
      where: { tenantId: tenant.id },
      create: {
        tenantId: tenant.id,
        whatsappPhoneNumberId: dto.whatsappPhoneNumberId,
        whatsappAccessToken: dto.whatsappAccessToken ? encryptSecret(dto.whatsappAccessToken) : undefined,
        invoiceProvider: dto.invoiceProvider,
        invoiceCredentials: dto.invoiceCredentials ? encryptJson(dto.invoiceCredentials) : undefined,
        shippingProvider: dto.shippingProvider,
        shippingCredentials: dto.shippingCredentials ? encryptJson(dto.shippingCredentials) : undefined,
      },
      update: {
        ...(dto.whatsappPhoneNumberId !== undefined ? { whatsappPhoneNumberId: dto.whatsappPhoneNumberId } : {}),
        ...(dto.whatsappAccessToken ? { whatsappAccessToken: encryptSecret(dto.whatsappAccessToken) } : {}),
        ...(dto.invoiceProvider !== undefined ? { invoiceProvider: dto.invoiceProvider } : {}),
        ...(dto.invoiceCredentials ? { invoiceCredentials: encryptJson(dto.invoiceCredentials) } : {}),
        ...(dto.shippingProvider !== undefined ? { shippingProvider: dto.shippingProvider } : {}),
        ...(dto.shippingCredentials ? { shippingCredentials: encryptJson(dto.shippingCredentials) } : {}),
      },
    });

    return this.getMe(tenant);
  }
}
