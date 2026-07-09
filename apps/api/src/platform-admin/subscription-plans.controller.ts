import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { PrismaClient } from "@esnaf101/db";
import { Public } from "../auth/public.decorator";
import { PlatformAdminAuthGuard } from "./auth/platform-admin-auth.guard";
import { CreateSubscriptionPlanDto } from "./dto/create-subscription-plan.dto";

@Public()
@UseGuards(PlatformAdminAuthGuard)
@Controller("admin/subscription-plans")
export class SubscriptionPlansController {
  constructor(private readonly prisma: PrismaClient) {}

  @Get()
  list() {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { monthlyPrice: "asc" } });
  }

  @Post()
  create(@Body() dto: CreateSubscriptionPlanDto) {
    return this.prisma.subscriptionPlan.create({ data: dto });
  }
}
