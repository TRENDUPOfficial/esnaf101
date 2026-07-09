import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@esnaf101/db";
import { AssignSubscriptionDto } from "./dto/assign-subscription.dto";
import { UpdateTenantStatusDto } from "./dto/update-tenant-status.dto";

@Injectable()
export class PlatformAdminTenantsService {
  constructor(private readonly prisma: PrismaClient) {}

  list() {
    return this.prisma.tenant.findMany({
      include: { subscription: { include: { plan: true } }, _count: { select: { orders: true, customers: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOne(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: { include: { plan: true, payments: true } }, settings: true },
    });
    if (!tenant) throw new NotFoundException("Tenant bulunamadı");
    return tenant;
  }

  async updateStatus(tenantId: string, dto: UpdateTenantStatusDto) {
    await this.getOne(tenantId);
    return this.prisma.tenant.update({ where: { id: tenantId }, data: { status: dto.status } });
  }

  async assignSubscription(tenantId: string, dto: AssignSubscriptionDto) {
    await this.getOne(tenantId);
    return this.prisma.subscription.upsert({
      where: { tenantId },
      create: { tenantId, planId: dto.planId, activeUntil: new Date(dto.activeUntil), status: "active" },
      update: { planId: dto.planId, activeUntil: new Date(dto.activeUntil), status: "active" },
    });
  }
}
