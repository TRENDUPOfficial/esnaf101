import { AppShell } from "../../../components/AppShell";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Button } from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Field";
import { TenantStatusBadge, SubscriptionStatusBadge, Badge } from "../../../components/ui/Badge";
import { AlertIcon } from "../../../components/icons";
import { adminApiFetch } from "../../../lib/api";
import { assignSubscription } from "../actions";

interface TenantDetail {
  id: string;
  name: string;
  status: string;
  settings: { iban: string | null; stockTrackingEnabled: boolean } | null;
  subscription: {
    plan: { name: string };
    status: string;
    activeUntil: string;
    payments: { status: string; amount: string; createdAt: string; failureReason: string | null }[];
  } | null;
}

interface PlanRow {
  id: string;
  name: string;
}

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tenant, plans] = await Promise.all([
    adminApiFetch(`/admin/tenants/${id}`) as Promise<TenantDetail>,
    adminApiFetch("/admin/subscription-plans") as Promise<PlanRow[]>,
  ]);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title={tenant.name}
          description="Tenant detayı ve abonelik yönetimi"
          actions={<TenantStatusBadge status={tenant.status} />}
        />

        <Card>
          <CardHeader title="Abonelik" />
          <CardBody className="space-y-4">
            {tenant.subscription ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-900">{tenant.subscription.plan.name}</span>
                <SubscriptionStatusBadge status={tenant.subscription.status} />
                <span>
                  bitiş: {new Date(tenant.subscription.activeUntil).toLocaleDateString("tr-TR")}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Abonelik tanımlı değil.</p>
            )}

            <form action={assignSubscription.bind(null, tenant.id)} className="flex flex-wrap items-center gap-2">
              <Select name="planId" required defaultValue="">
                <option value="" disabled>
                  Plan seç
                </option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Input name="activeUntil" type="date" required />
              <Button type="submit">Ata</Button>
            </form>

            {tenant.subscription && tenant.subscription.payments.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Tahsilat geçmişi</h3>
                <ul className="space-y-2">
                  {tenant.subscription.payments.map((p, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{new Date(p.createdAt).toLocaleDateString("tr-TR")}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant={p.status === "success" ? "success" : "danger"}>{p.status}</Badge>
                        <span className="text-slate-600">{p.amount} TL</span>
                      </span>
                    </li>
                  ))}
                  {tenant.subscription.payments.some((p) => p.failureReason) && (
                    <li className="mt-1 space-y-1">
                      {tenant.subscription.payments
                        .filter((p) => p.failureReason)
                        .map((p, i) => (
                          <p key={i} className="flex items-center gap-1.5 text-xs text-rose-600">
                            <AlertIcon className="h-3.5 w-3.5 shrink-0" />
                            {p.failureReason}
                          </p>
                        ))}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {!tenant.subscription && <EmptyState message="Tahsilat geçmişi yok." />}
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
