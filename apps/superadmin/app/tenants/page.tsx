import Link from "next/link";
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
    <main style={{ padding: "2rem 1rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Tenant&apos;lar</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Ad</th>
            <th style={{ textAlign: "left" }}>Durum</th>
            <th style={{ textAlign: "left" }}>Plan</th>
            <th style={{ textAlign: "right" }}>Sipariş</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id}>
              <td>
                <Link href={`/tenants/${t.id}`}>{t.name}</Link>
              </td>
              <td>{t.status}</td>
              <td>{t.subscription?.plan.name ?? "-"}</td>
              <td style={{ textAlign: "right" }}>{t._count.orders}</td>
              <td>
                <form action={setTenantStatus.bind(null, t.id, t.status === "suspended" ? "active" : "suspended")}>
                  <button type="submit">{t.status === "suspended" ? "Aktifleştir" : "Askıya al"}</button>
                </form>
              </td>
            </tr>
          ))}
          {tenants.length === 0 && (
            <tr>
              <td colSpan={5}>Henüz tenant yok.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
