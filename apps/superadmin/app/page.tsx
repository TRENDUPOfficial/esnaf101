import Link from "next/link";
import { adminApiFetch } from "../lib/api";
import { logout } from "./actions";

interface RevenueSummary {
  mrr: number;
  activeCount: number;
  suspendedCount: number;
  cancelledCount: number;
}

export default async function HomePage() {
  const revenue = (await adminApiFetch("/admin/revenue-summary")) as RevenueSummary;

  return (
    <main style={{ padding: "3rem 1rem", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Esnaf101 Süper Admin</h1>
        <form action={logout}>
          <button type="submit">Çıkış</button>
        </form>
      </div>

      <nav style={{ display: "flex", gap: "1rem", margin: "1.5rem 0" }}>
        <Link href="/tenants">Tenant'lar</Link>
        <Link href="/subscription-plans">Abonelik Planları</Link>
      </nav>

      <section style={{ display: "flex", gap: "2rem" }}>
        <div>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>Aylık tekrarlayan gelir (MRR)</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{revenue.mrr} TL</p>
        </div>
        <div>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>Aktif abonelik</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{revenue.activeCount}</p>
        </div>
        <div>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>Askıda</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{revenue.suspendedCount}</p>
        </div>
      </section>
    </main>
  );
}
