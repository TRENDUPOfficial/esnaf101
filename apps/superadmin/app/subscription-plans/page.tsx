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
    <main style={{ padding: "2rem 1rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>Abonelik Planları</h1>

      <form action={createPlan} style={{ display: "flex", gap: "0.5rem", margin: "1rem 0", flexWrap: "wrap" }}>
        <input name="name" placeholder="Plan adı" required />
        <input name="monthlyPrice" placeholder="Aylık ücret" type="number" step="0.01" required />
        <input name="orderLimit" placeholder="Sipariş limiti (opsiyonel)" type="number" />
        <button type="submit">Ekle</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Ad</th>
            <th style={{ textAlign: "right" }}>Aylık Ücret</th>
            <th style={{ textAlign: "right" }}>Sipariş Limiti</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td style={{ textAlign: "right" }}>{p.monthlyPrice} TL</td>
              <td style={{ textAlign: "right" }}>{p.orderLimit ?? "Limitsiz"}</td>
            </tr>
          ))}
          {plans.length === 0 && (
            <tr>
              <td colSpan={3}>Henüz plan yok.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
