import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Kimlik doğrulama gerektirmeyen route'lar için (health check, webhook'lar).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
