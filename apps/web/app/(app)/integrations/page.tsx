import { PageHeader } from "../../../components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input, Label } from "../../../components/ui/Field";
import { StoreIcon } from "../../../components/icons";
import { serverApiFetch } from "../../../lib/server-api";
import { ProviderGrid, type ProviderOption } from "./ProviderGrid";
import { updateBusinessSettings, updateParasut, updateShipentegra, updateWhatsApp } from "./actions";

interface IntegrationsMeResponse {
  whatsappPhoneNumberId: string | null;
  whatsappAccessTokenConfigured: boolean;
  invoiceProvider: string | null;
  invoiceCredentialsConfigured: boolean;
  shippingProvider: string | null;
  shippingCredentialsConfigured: boolean;
}

interface TenantMeResponse {
  settings: { stockTrackingEnabled: boolean; iban: string | null; ibanAccountHolder: string | null } | null;
}

// available:true olanların packages/integrations/* altında gerçek bir API
// adaptörü var (bkz. PLANNING.md). Diğerleri bilinçli olarak "Yakında" —
// sahte bir form gösterip kimlik bilgisini hiçbir yere göndermemek yerine
// ProviderGrid bunları durumu netçe belirterek listeliyor.
const SHIPPING_PROVIDERS: ProviderOption[] = [
  { id: "shipentegra", name: "Shipentegra", available: true },
  { id: "yurtici", name: "Yurtiçi Kargo", available: false },
  { id: "aras", name: "Aras Kargo", available: false },
  { id: "mng", name: "MNG Kargo", available: false },
  { id: "ptt", name: "PTT Kargo", available: false },
  { id: "surat", name: "Sürat Kargo", available: false },
  { id: "ups", name: "UPS Kargo", available: false },
  { id: "trendyolexpress", name: "Trendyol Express", available: false },
  { id: "hepsijet", name: "HepsiJet", available: false },
  { id: "sendeo", name: "Sendeo", available: false },
];

const INVOICE_PROVIDERS: ProviderOption[] = [
  { id: "parasut", name: "Paraşüt", available: true },
  { id: "logo", name: "Logo (e-Logo)", available: false },
  { id: "mikro", name: "Mikro", available: false },
  { id: "netsis", name: "Netsis", available: false },
  { id: "uyumsoft", name: "Uyumsoft", available: false },
  { id: "foriba", name: "Foriba", available: false },
  { id: "nilvera", name: "Nilvera", available: false },
  { id: "qnbefinans", name: "QNB eFinans", available: false },
  { id: "bizimhesap", name: "Bizim Hesap", available: false },
  { id: "dia", name: "Dia", available: false },
];

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? <Badge variant="success">Tanımlı</Badge> : <Badge variant="neutral">Tanımlı değil</Badge>;
}

export default async function IntegrationsPage() {
  const [integration, { settings }] = await Promise.all([
    serverApiFetch("/integrations/me") as Promise<IntegrationsMeResponse>,
    serverApiFetch("/tenants/me") as Promise<TenantMeResponse>,
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Entegrasyon Merkezi"
        description="Kargo, fatura ve WhatsApp bağlantılarınızı tek bir yerden yönetin. Girilen API anahtarları veritabanında şifreli olarak saklanır."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader title="İşletme ayarları" description="Müşterilere WhatsApp üzerinden ödeme talimatı gönderebilmek için IBAN'ınız gerekir." />
          <CardBody className="space-y-4">
            <form action={updateBusinessSettings} className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                <input
                  type="checkbox"
                  name="stockTrackingEnabled"
                  defaultChecked={settings?.stockTrackingEnabled ?? false}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                Stok takibini aktif et
              </label>
              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  name="iban"
                  defaultValue={settings?.iban ?? ""}
                  placeholder="TR000000000000000000000000"
                  maxLength={26}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="ibanAccountHolder">Hesap sahibi</Label>
                <Input
                  id="ibanAccountHolder"
                  name="ibanAccountHolder"
                  defaultValue={settings?.ibanAccountHolder ?? ""}
                  placeholder="Ad Soyad / Şirket Ünvanı"
                  className="w-full"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="WhatsApp" description="Sipariş otomasyonu için mesajlaşma ve ürünlerinizi WhatsApp'ta sergileyecek mağaza kataloğu." />
          <CardBody className="space-y-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">Cloud API (otomatik mesajlaşma)</span>
                <span className="text-sm text-slate-500">Numara: {integration.whatsappPhoneNumberId ?? "—"}</span>
                <StatusBadge configured={integration.whatsappAccessTokenConfigured} />
              </div>
              <form action={updateWhatsApp} className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="whatsappPhoneNumberId">phone_number_id</Label>
                  <Input id="whatsappPhoneNumberId" name="whatsappPhoneNumberId" className="w-full" />
                </div>
                <div>
                  <Label htmlFor="whatsappAccessToken">Erişim token&apos;ı (Meta System User)</Label>
                  <Input id="whatsappAccessToken" name="whatsappAccessToken" type="password" className="w-full" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Kaydet</Button>
                </div>
              </form>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <StoreIcon className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-900">WhatsApp Mağazası (ürün kataloğu)</span>
                <Badge variant="warning">Yakında</Badge>
              </div>
              <p className="text-sm text-slate-500">
                Müşterilerin WhatsApp içinden ürünlerinizi gezip sepete ekleyebildiği Meta Commerce katalog
                entegrasyonu — aynı WhatsApp Business hesabı üzerinden çalışır, otomatik mesajlaşmayla birlikte
                kullanılabilecek. Ürün listenizin kataloğa otomatik senkronizasyonu üzerinde çalışıyoruz.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Fatura sağlayıcıları" description="Sipariş fiyatı girildikten sonra otomatik e-fatura kesmek için bir sağlayıcı seçin." />
          <CardBody>
            <ProviderGrid
              providers={INVOICE_PROVIDERS}
              connectedId={integration.invoiceProvider}
              connectedLabel="Bağlı"
              forms={{
                parasut: (
                  <div className="space-y-4">
                    <StatusBadge configured={integration.invoiceCredentialsConfigured} />
                    <form action={updateParasut} className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input id="clientId" name="clientId" required className="w-full" />
                      </div>
                      <div>
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Input id="clientSecret" name="clientSecret" type="password" required className="w-full" />
                      </div>
                      <div>
                        <Label htmlFor="companyId">Company ID</Label>
                        <Input id="companyId" name="companyId" required className="w-full" />
                      </div>
                      <div>
                        <Label htmlFor="accessToken">Access Token</Label>
                        <Input id="accessToken" name="accessToken" type="password" required className="w-full" />
                      </div>
                      <div className="sm:col-span-2">
                        <Button type="submit">Kaydet</Button>
                      </div>
                    </form>
                  </div>
                ),
              }}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Kargo firmaları" description="Sipariş kargoya verildiğinde takip numarasını otomatik oluşturmak için bir firma seçin." />
          <CardBody>
            <ProviderGrid
              providers={SHIPPING_PROVIDERS}
              connectedId={integration.shippingProvider}
              connectedLabel="Bağlı"
              forms={{
                shipentegra: (
                  <div className="space-y-4">
                    <StatusBadge configured={integration.shippingCredentialsConfigured} />
                    <form action={updateShipentegra} className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input id="apiKey" name="apiKey" required className="w-full" />
                      </div>
                      <div>
                        <Label htmlFor="apiSecret">API Secret</Label>
                        <Input id="apiSecret" name="apiSecret" type="password" required className="w-full" />
                      </div>
                      <div className="sm:col-span-2">
                        <Button type="submit">Kaydet</Button>
                      </div>
                    </form>
                  </div>
                ),
              }}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
