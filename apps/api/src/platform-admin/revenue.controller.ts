import { Controller, Get, UseGuards } from "@nestjs/common";
import { PrismaClient } from "@esnaf101/db";
import { Public } from "../auth/public.decorator";
import { PlatformAdminAuthGuard } from "./auth/platform-admin-auth.guard";

@Public()
@UseGuards(PlatformAdminAuthGuard)
@Controller("admin/revenue-summary")
export class RevenueController {
  constructor(private readonly prisma: PrismaClient) {}

  @Get()
  async summary() {
    const subscriptions = await this.prisma.subscription.findMany({ include: { plan: true } });
    const active = subscriptions.filter((s) => s.status === "active");
    const mrr = active.reduce((sum, s) => sum + Number(s.plan.monthlyPrice), 0);

    return {
      mrr,
      activeCount: active.length,
      suspendedCount: subscriptions.filter((s) => s.status === "suspended").length,
      cancelledCount: subscriptions.filter((s) => s.status === "cancelled").length,
    };
  }
}
