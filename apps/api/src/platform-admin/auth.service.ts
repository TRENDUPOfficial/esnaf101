import { Injectable, UnauthorizedException } from "@nestjs/common";
import { compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { PrismaClient } from "@esnaf101/db";
import { buildOtpAuthUrl, generateTotpSecret, verifyTotpCode } from "./auth/totp";
import { ConfirmTwoFactorDto } from "./dto/confirm-two-factor.dto";
import { LoginDto } from "./dto/login.dto";

interface TempTokenPayload {
  sub: string;
  purpose: "totp-setup" | "totp-verify";
}

export type LoginResult =
  | { stage: "setup"; tempToken: string; otpAuthUrl: string; secret: string }
  | { stage: "verify"; tempToken: string };

/**
 * PLANNING.md Adım 9: süper admin girişinde 2FA zorunlu. İlk girişte
 * (twoFactorSecret henüz yoksa) otomatik bir TOTP sırrı üretilip kurulum
 * akışına yönlendirilir; kurulum tamamlanmadan (geçerli bir kod
 * doğrulanmadan) gerçek bir oturum token'ı verilmez. Bu yüzden şifre
 * doğru olsa bile `login()` tek başına asla tam yetkili bir token
 * döndürmez — her zaman `confirmTwoFactor()` gerekir.
 */
@Injectable()
export class PlatformAdminAuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const admin = await this.prisma.platformAdmin.findUnique({ where: { email: dto.email } });
    if (!admin || !(await compare(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException("E-posta veya şifre hatalı");
    }

    const secret = this.jwtSecret();

    if (!admin.twoFactorEnabled) {
      const totpSecret = admin.twoFactorSecret ?? generateTotpSecret();
      if (!admin.twoFactorSecret) {
        await this.prisma.platformAdmin.update({
          where: { id: admin.id },
          data: { twoFactorSecret: totpSecret },
        });
      }
      const tempToken = sign(
        { sub: admin.id, purpose: "totp-setup" } satisfies TempTokenPayload,
        secret,
        { expiresIn: "10m" },
      );
      return { stage: "setup", tempToken, otpAuthUrl: buildOtpAuthUrl(totpSecret, admin.email), secret: totpSecret };
    }

    const tempToken = sign(
      { sub: admin.id, purpose: "totp-verify" } satisfies TempTokenPayload,
      secret,
      { expiresIn: "10m" },
    );
    return { stage: "verify", tempToken };
  }

  async confirmTwoFactor(dto: ConfirmTwoFactorDto): Promise<{ token: string }> {
    const secret = this.jwtSecret();

    let payload: TempTokenPayload;
    try {
      payload = verify(dto.tempToken, secret) as TempTokenPayload;
    } catch {
      throw new UnauthorizedException("Geçersiz veya süresi dolmuş oturum başlatma isteği");
    }

    const admin = await this.prisma.platformAdmin.findUnique({ where: { id: payload.sub } });
    if (!admin?.twoFactorSecret) {
      throw new UnauthorizedException("2FA kurulumu tamamlanmamış");
    }

    if (!verifyTotpCode(admin.twoFactorSecret, dto.code)) {
      throw new UnauthorizedException("Doğrulama kodu hatalı");
    }

    if (payload.purpose === "totp-setup" && !admin.twoFactorEnabled) {
      await this.prisma.platformAdmin.update({ where: { id: admin.id }, data: { twoFactorEnabled: true } });
    }

    const token = sign({ sub: admin.id, email: admin.email }, secret, { expiresIn: "12h" });
    return { token };
  }

  private jwtSecret(): string {
    const secret = process.env.PLATFORM_ADMIN_JWT_SECRET;
    if (!secret) throw new Error("PLATFORM_ADMIN_JWT_SECRET tanımlı değil");
    return secret;
  }
}
