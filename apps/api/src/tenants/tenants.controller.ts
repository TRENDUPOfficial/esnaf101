import { Body, Controller, Get, Patch } from "@nestjs/common";
import type { Tenant } from "@esnaf101/db";
import { CurrentTenant } from "../auth/current-tenant.decorator";
import { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";
import { TenantsService } from "./tenants.service";

@Controller("tenants/me")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  getMe(@CurrentTenant() tenant: Tenant) {
    return this.tenantsService.getMe(tenant);
  }

  @Patch("onboarding")
  completeOnboarding(@CurrentTenant() tenant: Tenant, @Body() dto: CompleteOnboardingDto) {
    return this.tenantsService.completeOnboarding(tenant, dto);
  }
}
