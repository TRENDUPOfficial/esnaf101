import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { verifyToken } from "@clerk/backend";
import { PrismaClient } from "@esnaf101/db";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { SKIP_TENANT_KEY } from "./skip-tenant.decorator";

/**
 * Her API isteğinde:
 *  1. Clerk oturum JWT'sini doğrular (Authorization: Bearer <token>).
 *  2. Doğrulanmış kullanıcının aktif Clerk organizasyonundan (org_id) tenant'ı
 *     çözümler ve request'e ekler — bu, panelin çok kiracılı izolasyonunun
 *     API katmanındaki tek giriş noktasıdır (bkz. PLANNING.md "Tenant bazlı
 *     yetkilendirme middleware'i").
 *  3. Askıya alınmış tenant'lara erişimi reddeder.
 *
 * @Public() ile işaretli route'lar (health check, Clerk webhook) doğrulamadan
 * muaftır. @SkipTenant() ile işaretli route'lar kullanıcı doğrulamasından
 * geçer ama henüz bir organizasyona bağlı olmasını gerektirmez (onboarding'in
 * organizasyon oluşturma adımından önceki uçlar).
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException("Authorization header eksik");
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY tanımlı değil");
    }

    let payload: Awaited<ReturnType<typeof verifyToken>>;
    try {
      payload = await verifyToken(token, { secretKey });
    } catch {
      throw new UnauthorizedException("Geçersiz veya süresi dolmuş oturum");
    }

    request.auth = {
      userId: payload.sub,
      orgId: (payload as { org_id?: string }).org_id,
      orgRole: (payload as { org_role?: string }).org_role,
    };

    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipTenant) return true;

    if (!request.auth.orgId) {
      throw new ForbiddenException("Bu işlem için bir tenant (organizasyon) seçilmiş olmalı");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { clerkOrgId: request.auth.orgId },
    });
    if (!tenant) {
      throw new ForbiddenException("Bu organizasyona bağlı bir tenant bulunamadı");
    }
    if (tenant.status === "suspended") {
      throw new ForbiddenException("Bu tenant askıya alınmış");
    }

    request.tenant = tenant;
    return true;
  }
}

function extractBearerToken(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length);
}
