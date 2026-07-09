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
    <main style={{ padding: "2rem 1rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>{tenant.name}</h1>
      <p>Durum: {tenant.status}</p>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Abonelik</h2>
        {tenant.subscription ? (
          <p>
            {tenant.subscription.plan.name} — {tenant.subscription.status} — bitiş:{" "}
            {new Date(tenant.subscription.activeUntil).toLocaleDateString("tr-TR")}
          </p>
        ) : (
          <p>Abonelik tanımlı değil.</p>
        )}

        <form action={assignSubscription.bind(null, tenant.id)} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <select name="planId" required defaultValue="">
            <option value="" disabled>
              Plan seç
            </option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input name="activeUntil" type="date" required />
          <button type="submit">Ata</button>
        </form>

        {tenant.subscription && tenant.subscription.payments.length > 0 && (
          <>
            <h3 style={{ marginTop: "1rem" }}>Tahsilat geçmişi</h3>
            <ul>
              {tenant.subscription.payments.map((p, i) => (
                <li key={i}>
                  {new Date(p.createdAt).toLocaleDateString("tr-TR")} — {p.status} — {p.amount} TL
                  {p.failureReason ? ` (${p.failureReason})` : ""}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
