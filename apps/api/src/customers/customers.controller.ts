import { Controller, Get, Query } from "@nestjs/common";
import type { Tenant } from "@esnaf101/db";
import { PrismaClient } from "@esnaf101/db";
import { CurrentTenant } from "../auth/current-tenant.decorator";

@Controller("customers")
export class CustomersController {
  constructor(private readonly prisma: PrismaClient) {}

  @Get()
  list(@CurrentTenant() tenant: Tenant, @Query("search") search?: string) {
    return this.prisma.customer.findMany({
      where: {
        tenantId: tenant.id,
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { waId: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    });
  }
}
