import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../auth/public.decorator";
import { PlatformAdminAuthService } from "./auth.service";
import { ConfirmTwoFactorDto } from "./dto/confirm-two-factor.dto";
import { LoginDto } from "./dto/login.dto";

// Brute-force / TOTP kod tahmin denemesine karşı: global limitten (dk. başına
// 100) çok daha sıkı — dakikada en fazla 5 deneme.
const AUTH_THROTTLE = { default: { ttl: 60_000, limit: 5 } };

@Controller("admin/auth")
export class PlatformAdminAuthController {
  constructor(private readonly authService: PlatformAdminAuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("confirm-2fa")
  confirmTwoFactor(@Body() dto: ConfirmTwoFactorDto) {
    return this.authService.confirmTwoFactor(dto);
  }
}
