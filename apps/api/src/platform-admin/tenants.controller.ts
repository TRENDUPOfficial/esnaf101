import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { PlatformAdminAuthGuard } from "./auth/platform-admin-auth.guard";
import { AssignSubscriptionDto } from "./dto/assign-subscription.dto";
import { UpdateTenantStatusDto } from "./dto/update-tenant-status.dto";
import { PlatformAdminTenantsService } from "./tenants.service";

@Public()
@UseGuards(PlatformAdminAuthGuard)
@Controller("admin/tenants")
export class PlatformAdminTenantsController {
  constructor(private readonly tenantsService: PlatformAdminTenantsService) {}

  @Get()
  list() {
    return this.tenantsService.list();
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.tenantsService.getOne(id);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateTenantStatusDto) {
    return this.tenantsService.updateStatus(id, dto);
  }

  @Post(":id/subscription")
  assignSubscription(@Param("id") id: string, @Body() dto: AssignSubscriptionDto) {
    return this.tenantsService.assignSubscription(id, dto);
  }
}
