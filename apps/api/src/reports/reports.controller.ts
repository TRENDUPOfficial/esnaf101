import { Controller, Get } from "@nestjs/common";
import type { Tenant } from "@esnaf101/db";
import { CurrentTenant } from "../auth/current-tenant.decorator";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("summary")
  summary(@CurrentTenant() tenant: Tenant) {
    return this.reportsService.summary(tenant);
  }
}
