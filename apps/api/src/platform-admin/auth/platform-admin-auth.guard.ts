import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { verify } from "jsonwebtoken";
import type { Request } from "express";
import type { PlatformAdminJwtPayload } from "./platform-admin.types";

/**
 * Tenant panelinden (Clerk) tamamen ayrı bir kimlik doğrulama — süper admin
 * girişi platform_admins tablosuna karşı email+şifre ile yapılır, oturum bir
 * JWT ile taşınır (bkz. PLANNING.md Adım 9: "tenant kullanıcılarından
 * tamamen ayrı bir kimlik/rol alanı").
 *
 * NOT: MVP kapsamında 2FA henüz uygulanmadı (PLANNING.md'de "2FA zorunlu"
 * olarak belirtilmişti) — bu bilinçli bir kapsam daraltması, ileride
 * eklenmeli.
 */
@Injectable()
export class PlatformAdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authorization header eksik");
    }

    const secret = process.env.PLATFORM_ADMIN_JWT_SECRET;
    if (!secret) throw new Error("PLATFORM_ADMIN_JWT_SECRET tanımlı değil");

    try {
      const payload = verify(header.slice("Bearer ".length), secret) as PlatformAdminJwtPayload;
      request.platformAdmin = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Geçersiz veya süresi dolmuş oturum");
    }
  }
}
