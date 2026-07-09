import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaClient, Tenant } from "@esnaf101/db";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(tenant: Tenant, search?: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { barcode: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
    });
  }

  async create(tenant: Tenant, dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({ data: { tenantId: tenant.id, ...dto } });
    } catch (err) {
      throw mapUniqueSkuError(err);
    }
  }

  async update(tenant: Tenant, productId: string, dto: UpdateProductDto) {
    await this.findOwned(tenant, productId);
    try {
      return await this.prisma.product.update({ where: { id: productId }, data: dto });
    } catch (err) {
      throw mapUniqueSkuError(err);
    }
  }

  async remove(tenant: Tenant, productId: string) {
    await this.findOwned(tenant, productId);
    await this.prisma.product.delete({ where: { id: productId } });
  }

  private async findOwned(tenant: Tenant, productId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId: tenant.id } });
    if (!product) throw new NotFoundException("Ürün bulunamadı");
    return product;
  }
}

function mapUniqueSkuError(err: unknown): Error {
  if (err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002") {
    return new ConflictException("Bu SKU zaten kullanılıyor");
  }
  return err as Error;
}
