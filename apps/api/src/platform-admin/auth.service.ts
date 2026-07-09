import { Injectable, UnauthorizedException } from "@nestjs/common";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { PrismaClient } from "@esnaf101/db";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class PlatformAdminAuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async login(dto: LoginDto): Promise<{ token: string }> {
    const admin = await this.prisma.platformAdmin.findUnique({ where: { email: dto.email } });
    if (!admin || !(await compare(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException("E-posta veya şifre hatalı");
    }

    const secret = process.env.PLATFORM_ADMIN_JWT_SECRET;
    if (!secret) throw new Error("PLATFORM_ADMIN_JWT_SECRET tanımlı değil");

    const token = sign({ sub: admin.id, email: admin.email }, secret, { expiresIn: "12h" });
    return { token };
  }
}
