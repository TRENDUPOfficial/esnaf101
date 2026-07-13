import { PageHeader } from "../../../components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input, Label } from "../../../components/ui/Field";
import { serverApiFetch } from "../../../lib/server-api";
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

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? <Badge variant="success">Tanımlı</Badge> : <Badge variant="neutral">Tanımlı değil</Badge>;
}

export default async function IntegrationsPage() {
  const [integration, { settings }] = await Promise.all([
    serverApiFetch("/integrations/me") as Promise<IntegrationsMeResponse>,
    serverApiFetch("/tenants/me") as Promise<TenantMeResponse>,
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Entegrasyonlar" description="Buraya girilen API anahtarları veritabanında şifreli olarak saklanır." />

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
          <CardHeader title="WhatsApp Cloud API" />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
              <span>Numara: {integration.whatsappPhoneNumberId ?? "—"}</span>
              <StatusBadge configured={integration.whatsappAccessTokenConfigured} />
            </div>
            <form action={updateWhatsApp} className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="whatsappPhoneNumberId">phone_number_id</Label>
                <Input id="whatsappPhoneNumberId" name="whatsappPhoneNumberId"  className="w-full" />
              </div>
              <div>
                <Label htmlFor="whatsappAccessToken">Erişim token&apos;ı (Meta System User)</Label>
                <Input id="whatsappAccessToken" name="whatsappAccessToken" type="password"  className="w-full" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Paraşüt (e-fatura)" />
          <CardBody className="space-y-4">
            <StatusBadge configured={integration.invoiceCredentialsConfigured} />
            <form action={updateParasut} className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="clientId">Client ID</Label>
                <Input id="clientId" name="clientId" required  className="w-full" />
              </div>
              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input id="clientSecret" name="clientSecret" type="password" required  className="w-full" />
              </div>
              <div>
                <Label htmlFor="companyId">Company ID</Label>
                <Input id="companyId" name="companyId" required  className="w-full" />
              </div>
              <div>
                <Label htmlFor="accessToken">Access Token</Label>
                <Input id="accessToken" name="accessToken" type="password" required  className="w-full" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Shipentegra (kargo)" />
          <CardBody className="space-y-4">
            <StatusBadge configured={integration.shippingCredentialsConfigured} />
            <form action={updateShipentegra} className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" name="apiKey" required  className="w-full" />
              </div>
              <div>
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input id="apiSecret" name="apiSecret" type="password" required  className="w-full" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
