import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ClerkAuthGuard } from "./auth/clerk-auth.guard";
import { CustomersModule } from "./customers/customers.module";
import { HealthController } from "./health/health.controller";
import { IntegrationsModule } from "./integrations/integrations.module";
import { OrdersModule } from "./orders/orders.module";
import { PlatformAdminModule } from "./platform-admin/platform-admin.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { QueueModule } from "./queue/queue.module";
import { ReportsModule } from "./reports/reports.module";
import { TenantsModule } from "./tenants/tenants.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { WhatsAppModule } from "./whatsapp/whatsapp.module";

@Module({
  imports: [
    PrismaModule,
    QueueModule,
    TenantsModule,
    WebhooksModule,
    WhatsAppModule,
    ProductsModule,
    OrdersModule,
    IntegrationsModule,
    CustomersModule,
    ReportsModule,
    PlatformAdminModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ClerkAuthGuard }],
})
export class AppModule {}
