import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { Tenant } from "@esnaf101/db";
import { CurrentTenant } from "../auth/current-tenant.decorator";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@CurrentTenant() tenant: Tenant, @Query("search") search?: string) {
    return this.productsService.list(tenant, search);
  }

  @Post()
  create(@CurrentTenant() tenant: Tenant, @Body() dto: CreateProductDto) {
    return this.productsService.create(tenant, dto);
  }

  @Patch(":id")
  update(@CurrentTenant() tenant: Tenant, @Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(tenant, id, dto);
  }

  @Delete(":id")
  remove(@CurrentTenant() tenant: Tenant, @Param("id") id: string) {
    return this.productsService.remove(tenant, id);
  }
}
