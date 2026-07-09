import { Body, Controller, Get, Patch } from "@nestjs/common";
import type { Tenant } from "@esnaf101/db";
import { CurrentTenant } from "../auth/current-tenant.decorator";
import { UpdateIntegrationsDto } from "./dto/update-integrations.dto";
import { IntegrationsService } from "./integrations.service";

@Controller("integrations/me")
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  getMe(@CurrentTenant() tenant: Tenant) {
    return this.integrationsService.getMe(tenant);
  }

  @Patch()
  updateMe(@CurrentTenant() tenant: Tenant, @Body() dto: UpdateIntegrationsDto) {
    return this.integrationsService.updateMe(tenant, dto);
  }
}
