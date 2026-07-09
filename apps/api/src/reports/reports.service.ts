import { Injectable } from "@nestjs/common";
import { PrismaClient, Tenant } from "@esnaf101/db";

const PAID_STATUSES = ["paid", "shipped"] as const;
const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaClient) {}

  async summary(tenant: Tenant) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [revenueAgg, ordersThisMonth, topProducts, lowStockProducts] = await Promise.all([
      this.prisma.order.aggregate({
        where: { tenantId: tenant.id, status: { in: [...PAID_STATUSES] }, paidAt: { gte: monthStart } },
        _sum: { price: true },
      }),
      this.prisma.order.count({ where: { tenantId: tenant.id, createdAt: { gte: monthStart } } }),
      this.prisma.order.groupBy({
        by: ["productId"],
        where: { tenantId: tenant.id, status: { in: [...PAID_STATUSES] }, productId: { not: null } },
        _count: { _all: true },
        _sum: { price: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      }),
      this.prisma.product.findMany({
        where: { tenantId: tenant.id, stockQty: { not: null, lte: LOW_STOCK_THRESHOLD } },
        orderBy: { stockQty: "asc" },
        take: 10,
      }),
    ]);

    const productIds = topProducts.map((row) => row.productId).filter((id): id is string => Boolean(id));
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    const productById = new Map(products.map((p) => [p.id, p]));

    return {
      revenueThisMonth: revenueAgg._sum.price ?? 0,
      ordersThisMonth,
      topProducts: topProducts.map((row) => ({
        productId: row.productId,
        name: row.productId ? productById.get(row.productId)?.name : null,
        orderCount: row._count._all,
        revenue: row._sum.price ?? 0,
      })),
      lowStockProducts,
    };
  }
}
