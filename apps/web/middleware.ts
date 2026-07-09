import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isOrganizationOnboardingRoute = createRouteMatcher(["/onboarding/organization(.*)"]);

/**
 * Tenant bazlı yetkilendirmenin Next.js tarafındaki girişi: kullanıcının
 * Clerk oturumu olmasını zorunlu kılar (auth.protect()) ve aktif bir
 * organizasyonu (tenant) yoksa organizasyon oluşturma adımına yönlendirir.
 * Gerçek tenant çözümlemesi ve askıya alma kontrolü NestJS API'deki
 * ClerkAuthGuard'da yapılır — burası sadece panel içi yönlendirme.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { orgId } = await auth.protect();

  if (!orgId && !isOrganizationOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding/organization", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
