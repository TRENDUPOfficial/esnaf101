import { AppShell } from "../../components/AppShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Field";
import { adminApiFetch } from "../../lib/api";
import { createPlan } from "./actions";

interface PlanRow {
  id: string;
  name: string;
  monthlyPrice: string;
  orderLimit: number | null;
  isActive: boolean;
}

export default async function SubscriptionPlansPage() {
  const plans = (await adminApiFetch("/admin/subscription-plans")) as PlanRow[];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Abonelik Planları" description="Tenant'lara atanabilecek paketler" />

        <Card className="mb-6">
          <CardBody>
            <form action={createPlan} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-2">
                <Label htmlFor="name">Plan adı</Label>
                <Input id="name" name="name" placeholder="Başlangıç" required className="w-full" />
              </div>
              <div>
                <Label htmlFor="monthlyPrice">Aylık ücret</Label>
                <Input id="monthlyPrice" name="monthlyPrice" type="number" step="0.01" required className="w-full" />
              </div>
              <div>
                <Label htmlFor="orderLimit">Sipariş limiti</Label>
                <Input id="orderLimit" name="orderLimit" type="number" placeholder="opsiyonel" className="w-full" />
              </div>
              <div className="col-span-2 sm:col-span-4">
                <Button type="submit">Ekle</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          {plans.length === 0 ? (
            <CardBody>
              <EmptyState message="Henüz plan yok." />
            </CardBody>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Ad</th>
                  <th className="px-5 py-3 text-right font-medium">Aylık Ücret</th>
                  <th className="px-5 py-3 text-right font-medium">Sipariş Limiti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{p.monthlyPrice} TL</td>
                    <td className="px-5 py-3 text-right text-slate-600">{p.orderLimit ?? "Limitsiz"}</td>
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
