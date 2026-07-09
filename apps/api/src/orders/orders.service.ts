import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, PrismaClient, Tenant } from "@esnaf101/db";
import { Queue } from "bullmq";
import { INVOICE_CREATE_QUEUE, SHIPMENT_CREATE_QUEUE } from "../queue/queue.module";
import { QUEUE_NAMES } from "../queue/queue-names";
import { AssignPriceDto } from "./dto/assign-price.dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaClient,
    @Inject(INVOICE_CREATE_QUEUE) private readonly invoiceQueue: Queue,
    @Inject(SHIPMENT_CREATE_QUEUE) private readonly shipmentQueue: Queue,
  ) {}

  async list(tenant: Tenant, status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: { tenantId: tenant.id, ...(status ? { status } : {}) },
      include: { customer: true, product: true, invoice: true, shipment: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async getOne(tenant: Tenant, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: tenant.id },
      include: { customer: true, product: true, invoice: true, shipment: true },
    });
    if (!order) throw new NotFoundException("Sipariş bulunamadı");
    return order;
  }

  /**
   * Adım 4: personel ekran görüntüsüne bakıp ürünü seçip fiyatı giriyor.
   * Stok takibi açıksa ve ürün stoksuzsa reddedilir; kapanınca sipariş
   * fatura kesme kuyruğuna (Adım 5) devredilir.
   */
  async assignPrice(tenant: Tenant, orderId: string, dto: AssignPriceDto) {
    const order = await this.getOne(tenant, orderId);
    if (order.status !== "awaiting_product_price") {
      throw new BadRequestException(`Sipariş bu işlem için uygun durumda değil: ${order.status}`);
    }

    const product = await this.prisma.product.findFirst({ where: { id: dto.productId, tenantId: tenant.id } });
    if (!product) throw new NotFoundException("Ürün bulunamadı");

    const settings = await this.prisma.tenantSettings.findUnique({ where: { tenantId: tenant.id } });
    const stockTracked = settings?.stockTrackingEnabled && product.stockQty !== null;
    if (stockTracked && (product.stockQty as number) <= 0) {
      throw new BadRequestException("Ürün stokta yok");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (stockTracked) {
        await tx.product.update({ where: { id: product.id }, data: { stockQty: { decrement: 1 } } });
      }
      return tx.order.update({
        where: { id: orderId },
        data: { productId: product.id, price: dto.price, status: "awaiting_invoice", lastErrorMessage: null },
      });
    });

    await this.invoiceQueue.add(QUEUE_NAMES.invoiceCreate, { tenantId: tenant.id, orderId });
    return updated;
  }

  /**
   * Adım 5: personel havale/EFT ödemesinin geldiğini panelden işaretliyor.
   * Bu noktadan sonra sipariş kilitlenir (iptal edilemez, MVP kapsamı) ve
   * kargo etiketi oluşturma kuyruğuna (Adım 6) devredilir.
   */
  async markPaid(tenant: Tenant, orderId: string) {
    const order = await this.getOne(tenant, orderId);
    if (order.status !== "awaiting_payment") {
      throw new BadRequestException(`Sipariş bu işlem için uygun durumda değil: ${order.status}`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: "paid", paidAt: new Date(), lastErrorMessage: null },
    });

    await this.shipmentQueue.add(QUEUE_NAMES.shipmentCreate, { tenantId: tenant.id, orderId });
    return updated;
  }
}
