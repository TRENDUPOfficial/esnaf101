import { PageHeader } from "../../../components/ui/PageHeader";
import { Card, CardBody } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { serverApiFetch } from "../../../lib/server-api";

interface CustomerRow {
  id: string;
  waId: string;
  fullName: string | null;
  address: string | null;
  _count: { orders: number };
}

export default async function CustomersPage() {
  const customers = (await serverApiFetch("/customers")) as CustomerRow[];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Müşteriler" description="WhatsApp üzerinden tanınan tüm müşteriler" />

      <Card>
        {customers.length === 0 ? (
          <CardBody>
            <EmptyState message="Henüz müşteri yok." />
          </CardBody>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Ad</th>
                <th className="px-5 py-3 font-medium">Telefon</th>
                <th className="px-5 py-3 font-medium">Adres</th>
                <th className="px-5 py-3 text-right font-medium">Sipariş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{c.fullName ?? "-"}</td>
                  <td className="px-5 py-3 text-slate-500">{c.waId}</td>
                  <td className="px-5 py-3 text-slate-500">{c.address ?? "-"}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{c._count.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
