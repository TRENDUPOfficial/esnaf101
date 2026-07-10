import { PageHeader } from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Field";
import { AlertIcon } from "../../../components/icons";
import { serverApiFetch } from "../../../lib/server-api";
import { assignPrice, markPaid } from "./actions";
import { ProductAutocomplete } from "./ProductAutocomplete";

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

export default async function OrdersPage() {
  const [pending, awaitingPayment] = await Promise.all([
    serverApiFetch("/orders?status=awaiting_product_price") as Promise<OrderRow[]>,
    serverApiFetch("/orders?status=awaiting_payment") as Promise<OrderRow[]>,
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Siparişler" description="Ekran görüntüsünden gelen siparişleri onaylayın ve takip edin" />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          Fiyat bekliyor
          <Badge variant="warning">{pending.length}</Badge>
        </h2>

        {pending.length === 0 ? (
          <EmptyState message="Bekleyen sipariş yok." />
        ) : (
          <div className="space-y-4">
            {pending.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex gap-4">
                  {order.screenshotUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.screenshotUrl}
                      alt="ekran görüntüsü"
                      className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="h-20 w-20 shrink-0 rounded-lg bg-slate-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{order.customer.fullName ?? "İsimsiz"}</p>
                    <p className="text-sm text-slate-500">{order.customer.waId}</p>
                    {order.customer.address && <p className="mt-0.5 text-sm text-slate-500">{order.customer.address}</p>}
                    {order.rawDescription && <p className="mt-1 text-sm text-slate-600">Not: {order.rawDescription}</p>}
                    {order.lastErrorMessage && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-rose-600">
                        <AlertIcon className="h-4 w-4 shrink-0" />
                        {order.lastErrorMessage}
                      </p>
                    )}
                  </div>
                </div>
                <form action={assignPrice.bind(null, order.id)} className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <ProductAutocomplete name="productId" />
                  <Input name="price" type="number" step="0.01" placeholder="Fiyat" required className="w-32" />
                  <Button type="submit">Onayla</Button>
                </form>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          Ödeme bekliyor
          <Badge variant="info">{awaitingPayment.length}</Badge>
        </h2>

        {awaitingPayment.length === 0 ? (
          <EmptyState message="Ödeme bekleyen sipariş yok." />
        ) : (
          <div className="space-y-4">
            {awaitingPayment.map((order) => (
              <Card key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {order.customer.fullName} <span className="font-normal text-slate-500">— {order.customer.waId}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">{order.price} TL</p>
                  {order.invoice?.externalRef && (
                    <p className="mt-0.5 text-xs text-slate-400">Fatura no: {order.invoice.externalRef}</p>
                  )}
                  {order.lastErrorMessage && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-rose-600">
                      <AlertIcon className="h-4 w-4 shrink-0" />
                      {order.lastErrorMessage}
                    </p>
                  )}
                </div>
                <form action={markPaid.bind(null, order.id)}>
                  <Button type="submit" variant="secondary">
                    Ödendi olarak işaretle
                  </Button>
                </form>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
