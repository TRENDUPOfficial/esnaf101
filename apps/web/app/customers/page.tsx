import { serverApiFetch } from "../../lib/server-api";

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
    <main style={{ padding: "2rem 1rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Müşteriler</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Ad</th>
            <th style={{ textAlign: "left" }}>Telefon</th>
            <th style={{ textAlign: "left" }}>Adres</th>
            <th style={{ textAlign: "right" }}>Sipariş</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.fullName ?? "-"}</td>
              <td>{c.waId}</td>
              <td>{c.address ?? "-"}</td>
              <td style={{ textAlign: "right" }}>{c._count.orders}</td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={4}>Henüz müşteri yok.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
