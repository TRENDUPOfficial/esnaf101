import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import type { Tenant } from "@esnaf101/db";
import type { Request } from "express";

/**
 * ClerkAuthGuard tarafından request'e eklenen tenant'ı controller
 * handler'ına enjekte eder. Guard tenant'ı zaten çözümlediği için (aksi halde
 * request 401/403 ile reddedilir), burada eksikse bu bir programlama hatasıdır.
 */
export const CurrentTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext): Tenant => {
  const request = ctx.switchToHttp().getRequest<Request>();
  if (!request.tenant) {
    throw new InternalServerErrorException(
      "CurrentTenant() kullanılan route ClerkAuthGuard'ın tenant çözümlemesinden geçmemiş",
    );
  }
  return request.tenant;
});
