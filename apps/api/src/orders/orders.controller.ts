import { BadRequestException, Controller, Get, Param, Patch, Body, Query } from "@nestjs/common";
import { OrderStatus } from "@esnaf101/db";
import type { Tenant } from "@esnaf101/db";
import { CurrentTenant } from "../auth/current-tenant.decorator";
import { AssignPriceDto } from "./dto/assign-price.dto";
import { OrdersService } from "./orders.service";

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@CurrentTenant() tenant: Tenant, @Query("status") status?: string) {
    if (status && !VALID_STATUSES.has(status)) {
      throw new BadRequestException(`Geçersiz durum: ${status}`);
    }
    return this.ordersService.list(tenant, status as OrderStatus | undefined);
  }

  @Get(":id")
  getOne(@CurrentTenant() tenant: Tenant, @Param("id") id: string) {
    return this.ordersService.getOne(tenant, id);
  }

  @Patch(":id/assign-price")
  assignPrice(@CurrentTenant() tenant: Tenant, @Param("id") id: string, @Body() dto: AssignPriceDto) {
    return this.ordersService.assignPrice(tenant, id, dto);
  }

  @Patch(":id/mark-paid")
  markPaid(@CurrentTenant() tenant: Tenant, @Param("id") id: string) {
    return this.ordersService.markPaid(tenant, id);
  }
}
