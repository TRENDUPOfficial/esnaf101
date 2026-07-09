import { serverApiFetch } from "../../lib/server-api";
import { assignPrice, markPaid } from "./actions";

interface Customer {
  fullName: string | null;
  waId: string;
  address: string | null;
}

interface OrderRow {
  id: string;
  screenshotUrl: string | null;
  rawDescription: string | null;
  price: string | null;
  status: string;
  lastErrorMessage: string | null;
  customer: Customer;
  invoice: { externalRef: string | null } | null;
  shipment: { trackingNumber: string | null } | null;
}

interface ProductRow {
  id: string;
  name: string;
}

export default async function OrdersPage() {
  const [pending, awaitingPayment, products] = await Promise.all([
    serverApiFetch("/orders?status=awaiting_product_price") as Promise<OrderRow[]>,
    serverApiFetch("/orders?status=awaiting_payment") as Promise<OrderRow[]>,
    serverApiFetch("/products") as Promise<ProductRow[]>,
  ]);

  return (
    <main style={{ padding: "2rem 1rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Siparişler</h1>

      <section>
        <h2>Fiyat bekliyor ({pending.length})</h2>
        {pending.map((order) => (
          <div key={order.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              {order.screenshotUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.screenshotUrl} alt="ekran görüntüsü" style={{ width: 96, height: 96, objectFit: "cover" }} />
              )}
              <div>
                <p>
                  <strong>{order.customer.fullName ?? "İsimsiz"}</strong> — {order.customer.waId}
                </p>
                <p>{order.customer.address}</p>
                {order.rawDescription && <p>Not: {order.rawDescription}</p>}
                {order.lastErrorMessage && <p style={{ color: "crimson" }}>Hata: {order.lastErrorMessage}</p>}
              </div>
            </div>
            <form action={assignPrice.bind(null, order.id)} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <select name="productId" required defaultValue="">
                <option value="" disabled>
                  Ürün seç
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input name="price" type="number" step="0.01" placeholder="Fiyat" required />
              <button type="submit">Onayla</button>
            </form>
          </div>
        ))}
        {pending.length === 0 && <p>Bekleyen sipariş yok.</p>}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Ödeme bekliyor ({awaitingPayment.length})</h2>
        {awaitingPayment.map((order) => (
          <div key={order.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
            <p>
              <strong>{order.customer.fullName}</strong> — {order.customer.waId} — {order.price} TL
            </p>
            {order.invoice?.externalRef && <p>Fatura no: {order.invoice.externalRef}</p>}
            {order.lastErrorMessage && <p style={{ color: "crimson" }}>Hata: {order.lastErrorMessage}</p>}
            <form action={markPaid.bind(null, order.id)}>
              <button type="submit">Ödendi olarak işaretle</button>
            </form>
          </div>
        ))}
        {awaitingPayment.length === 0 && <p>Ödeme bekleyen sipariş yok.</p>}
      </section>
    </main>
  );
}
