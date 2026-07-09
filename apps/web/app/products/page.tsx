import { serverApiFetch } from "../../lib/server-api";
import { createProduct, deleteProduct } from "./actions";

interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  listPrice: string | null;
  stockQty: number | null;
}

export default async function ProductsPage() {
  const products = (await serverApiFetch("/products")) as ProductRow[];

  return (
    <main style={{ padding: "2rem 1rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Ürünler</h1>

      <form action={createProduct} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1rem 0" }}>
        <input name="name" placeholder="Ürün adı" required />
        <input name="sku" placeholder="SKU (opsiyonel)" />
        <input name="listPrice" placeholder="Liste fiyatı" type="number" step="0.01" />
        <input name="stockQty" placeholder="Stok adedi (opsiyonel)" type="number" />
        <button type="submit">Ekle</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Ad</th>
            <th style={{ textAlign: "left" }}>SKU</th>
            <th style={{ textAlign: "right" }}>Liste Fiyatı</th>
            <th style={{ textAlign: "right" }}>Stok</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku ?? "-"}</td>
              <td style={{ textAlign: "right" }}>{p.listPrice ?? "-"}</td>
              <td style={{ textAlign: "right" }}>{p.stockQty ?? "-"}</td>
              <td>
                <form action={deleteProduct.bind(null, p.id)}>
                  <button type="submit">Sil</button>
                </form>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={5}>Henüz ürün yok.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
