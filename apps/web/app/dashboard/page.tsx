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
    <main style={{ padding: "2rem 1rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Panel</h1>

      <section style={{ display: "flex", gap: "2rem", margin: "1.5rem 0" }}>
        <div>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>Bu ay ciro</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{summary.revenueThisMonth} TL</p>
        </div>
        <div>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>Bu ay sipariş</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{summary.ordersThisMonth}</p>
        </div>
      </section>

      <section>
        <h2>En çok satan ürünler</h2>
        <ul>
          {summary.topProducts.map((p) => (
            <li key={p.productId}>
              {p.name ?? "Bilinmeyen ürün"} — {p.orderCount} sipariş, {p.revenue} TL
            </li>
          ))}
          {summary.topProducts.length === 0 && <li>Henüz veri yok.</li>}
        </ul>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Düşük stok uyarıları</h2>
        <ul>
          {summary.lowStockProducts.map((p) => (
            <li key={p.id}>
              {p.name} — {p.stockQty} adet kaldı
            </li>
          ))}
          {summary.lowStockProducts.length === 0 && <li>Düşük stoklu ürün yok.</li>}
        </ul>
      </section>
    </main>
  );
}
