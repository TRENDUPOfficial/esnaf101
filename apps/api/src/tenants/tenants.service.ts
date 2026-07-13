import { Injectable } from "@nestjs/common";
import { PrismaClient, Tenant } from "@esnaf101/db";
import { UpdateTenantSettingsDto } from "./dto/update-tenant-settings.dto";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getMe(tenant: Tenant) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId: tenant.id },
    });
    return { tenant, settings };
  }

  async updateSettings(tenant: Tenant, dto: UpdateTenantSettingsDto) {
    return this.prisma.tenantSettings.upsert({
      where: { tenantId: tenant.id },
      update: dto,
      create: {
        tenantId: tenant.id,
        stockTrackingEnabled: dto.stockTrackingEnabled ?? false,
        iban: dto.iban,
        ibanAccountHolder: dto.ibanAccountHolder,
      },
    });
  }
}
