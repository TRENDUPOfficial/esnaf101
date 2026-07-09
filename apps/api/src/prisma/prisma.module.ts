import { Global, Module } from "@nestjs/common";
import { PrismaClient, prisma } from "@esnaf101/db";

@Global()
@Module({
  providers: [{ provide: PrismaClient, useValue: prisma }],
  exports: [PrismaClient],
})
export class PrismaModule {}
