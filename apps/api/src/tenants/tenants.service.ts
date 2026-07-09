import { Injectable } from "@nestjs/common";
import { PrismaClient, Tenant } from "@esnaf101/db";
import { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getMe(tenant: Tenant) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId: tenant.id },
    });
    return { tenant, settings };
  }

  async completeOnboarding(tenant: Tenant, dto: CompleteOnboardingDto) {
    const [, updatedTenant] = await this.prisma.$transaction([
      this.prisma.tenantSettings.upsert({
        where: { tenantId: tenant.id },
        update: {
          stockTrackingEnabled: dto.stockTrackingEnabled,
          iban: dto.iban,
          ibanAccountHolder: dto.ibanAccountHolder,
        },
        create: {
          tenantId: tenant.id,
          stockTrackingEnabled: dto.stockTrackingEnabled,
          iban: dto.iban,
          ibanAccountHolder: dto.ibanAccountHolder,
        },
      }),
      this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { status: "active" },
      }),
    ]);

    return updatedTenant;
  }
}
