import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { AlertIcon, CartIcon, TrendingUpIcon } from "../../components/icons";
import { serverApiFetch } from "../../lib/server-api";

interface SummaryResponse {
  revenueThisMonth: string | number;
  ordersThisMonth: number;
  topProducts: { productId: string | null; name: string | null; orderCount: number; revenue: string | number }[];
  lowStockProducts: { id: string; name: string; stockQty: number | null }[];
}

export default async function DashboardPage() {
  const summary = (await serverApiFetch("/reports/summary")) as SummaryResponse;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Panel" description="Bu ayki özet performans" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Bu ay ciro" value={`${summary.revenueThisMonth} TL`} icon={<TrendingUpIcon />} />
        <StatCard label="Bu ay sipariş" value={summary.ordersThisMonth} icon={<CartIcon />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="En çok satan ürünler" />
          <CardBody>
            {summary.topProducts.length === 0 ? (
              <EmptyState message="Henüz veri yok." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {summary.topProducts.map((p) => (
                  <li key={p.productId} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-medium text-slate-800">{p.name ?? "Bilinmeyen ürün"}</span>
                    <span className="text-slate-500">
                      {p.orderCount} sipariş · {p.revenue} TL
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Düşük stok uyarıları" />
          <CardBody>
            {summary.lowStockProducts.length === 0 ? (
              <EmptyState message="Düşük stoklu ürün yok." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {summary.lowStockProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-800">
                      <AlertIcon className="h-4 w-4 text-amber-500" />
                      {p.name}
                    </span>
                    <span className="text-slate-500">{p.stockQty} adet kaldı</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
