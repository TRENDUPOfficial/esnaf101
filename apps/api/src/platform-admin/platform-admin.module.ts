import { Module } from "@nestjs/common";
import { PlatformAdminAuthController } from "./auth.controller";
import { PlatformAdminAuthService } from "./auth.service";
import { RevenueController } from "./revenue.controller";
import { SubscriptionPlansController } from "./subscription-plans.controller";
import { PlatformAdminTenantsController } from "./tenants.controller";
import { PlatformAdminTenantsService } from "./tenants.service";

@Module({
  controllers: [
    PlatformAdminAuthController,
    PlatformAdminTenantsController,
    SubscriptionPlansController,
    RevenueController,
  ],
  providers: [PlatformAdminAuthService, PlatformAdminTenantsService],
})
export class PlatformAdminModule {}
