import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { TenantStatusBadge } from "../../components/ui/Badge";
import { adminApiFetch } from "../../lib/api";
import { setTenantStatus } from "./actions";

interface TenantRow {
  id: string;
  name: string;
  status: string;
  subscription: { plan: { name: string }; activeUntil: string; status: string } | null;
  _count: { orders: number; customers: number };
}

export default async function TenantsPage() {
  const tenants = (await adminApiFetch("/admin/tenants")) as TenantRow[];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Tenant'lar" description="Platformdaki tüm satıcı hesapları" />
        <Card>
          {tenants.length === 0 ? (
            <CardBody>
              <EmptyState message="Henüz tenant yok." />
            </CardBody>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Ad</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 text-right font-medium">Sipariş</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      <Link href={`/tenants/${t.id}`} className="hover:text-indigo-600">
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <TenantStatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-600">{t.subscription?.plan.name ?? "-"}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{t._count.orders}</td>
                    <td className="px-5 py-3 text-right">
                      <form action={setTenantStatus.bind(null, t.id, t.status === "suspended" ? "active" : "suspended")}>
                        <button
                          type="submit"
                          className={`text-sm font-medium ${
                            t.status === "suspended" ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-rose-600"
                          }`}
                        >
                          {t.status === "suspended" ? "Aktifleştir" : "Askıya al"}
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
    </AppShell>
  );
}
