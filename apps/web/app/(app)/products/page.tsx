import { PageHeader } from "../../../components/ui/PageHeader";
import { Card, CardBody } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Button } from "../../../components/ui/Button";
import { Input, Label } from "../../../components/ui/Field";
import { serverApiFetch } from "../../../lib/server-api";
import { createProduct, deleteProduct } from "./actions";

interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  listPrice: string | null;
  stockQty: number | null;
}

export default async function ProductsPage() {
  const products = (await serverApiFetch("/products")) as ProductRow[];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ürünler" description="Ürün kataloğunuzu yönetin" />

      <Card className="mb-6">
        <CardBody>
          <form action={createProduct} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="name">Ürün adı</Label>
              <Input id="name" name="name" placeholder="Mavi elbise" required className="w-full" />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" placeholder="opsiyonel" className="w-full" />
            </div>
            <div>
              <Label htmlFor="listPrice">Liste fiyatı</Label>
              <Input id="listPrice" name="listPrice" type="number" step="0.01" placeholder="opsiyonel" className="w-full" />
            </div>
            <div>
              <Label htmlFor="stockQty">Stok</Label>
              <Input id="stockQty" name="stockQty" type="number" placeholder="opsiyonel" className="w-full" />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <Button type="submit">Ekle</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        {products.length === 0 ? (
          <CardBody>
            <EmptyState message="Henüz ürün yok." />
          </CardBody>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Ad</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 text-right font-medium">Liste Fiyatı</th>
                <th className="px-5 py-3 text-right font-medium">Stok</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-5 py-3 text-slate-500">{p.sku ?? "-"}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{p.listPrice ?? "-"}</td>
                  <td className="px-5 py-3 text-right text-slate-600">
                    {p.stockQty === 0 ? <span className="text-rose-500">0</span> : (p.stockQty ?? "-")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteProduct.bind(null, p.id)}>
                      <button type="submit" className="text-sm font-medium text-slate-400 hover:text-rose-600">
                        Sil
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
