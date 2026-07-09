import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "esnaf101_admin_token";

/**
 * Süper admin paneli Clerk kullanmıyor — tenant panelinden tamamen ayrı bir
 * kimlik doğrulama (bkz. PLANNING.md Adım 9). Burada sadece cookie'nin
 * varlığı kontrol edilir; gerçek doğrulama her istekte apps/api'deki
 * PlatformAdminAuthGuard tarafından yapılır.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/login")) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
