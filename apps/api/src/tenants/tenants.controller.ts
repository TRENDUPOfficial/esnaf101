import { Body, Controller, Get, Patch } from "@nestjs/common";
import type { Tenant } from "@esnaf101/db";
import { CurrentTenant } from "../auth/current-tenant.decorator";
import { UpdateTenantSettingsDto } from "./dto/update-tenant-settings.dto";
import { TenantsService } from "./tenants.service";

@Controller("tenants/me")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  getMe(@CurrentTenant() tenant: Tenant) {
    return this.tenantsService.getMe(tenant);
  }

  @Patch("settings")
  updateSettings(@CurrentTenant() tenant: Tenant, @Body() dto: UpdateTenantSettingsDto) {
    return this.tenantsService.updateSettings(tenant, dto);
  }
}
