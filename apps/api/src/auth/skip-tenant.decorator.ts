import { SetMetadata } from "@nestjs/common";

export const SKIP_TENANT_KEY = "skipTenant";

/**
 * Kullanıcı doğrulanmış olsun ama henüz bir Clerk organizasyonuna (tenant'a)
 * bağlı olmasına gerek olmayan route'lar için (örn. onboarding'in
 * organizasyon oluşturma adımından önceki uçlar).
 */
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);
