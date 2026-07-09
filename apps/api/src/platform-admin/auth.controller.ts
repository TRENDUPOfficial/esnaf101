import { Body, Controller, Post } from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { PlatformAdminAuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("admin/auth")
export class PlatformAdminAuthController {
  constructor(private readonly authService: PlatformAdminAuthService) {}

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
