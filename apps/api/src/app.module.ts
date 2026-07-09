import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ClerkAuthGuard } from "./auth/clerk-auth.guard";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { TenantsModule } from "./tenants/tenants.module";
import { WebhooksModule } from "./webhooks/webhooks.module";

@Module({
  imports: [PrismaModule, TenantsModule, WebhooksModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ClerkAuthGuard }],
})
export class AppModule {}
