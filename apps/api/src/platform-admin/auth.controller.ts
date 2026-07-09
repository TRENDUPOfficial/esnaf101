import { Body, Controller, Post } from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { PlatformAdminAuthService } from "./auth.service";
import { ConfirmTwoFactorDto } from "./dto/confirm-two-factor.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("admin/auth")
export class PlatformAdminAuthController {
  constructor(private readonly authService: PlatformAdminAuthService) {}

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("confirm-2fa")
  confirmTwoFactor(@Body() dto: ConfirmTwoFactorDto) {
    return this.authService.confirmTwoFactor(dto);
  }
}
