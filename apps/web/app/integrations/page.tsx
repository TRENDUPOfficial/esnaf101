import { serverApiFetch } from "../../lib/server-api";
import { updateParasut, updateShipentegra, updateWhatsApp } from "./actions";

interface IntegrationsMeResponse {
  whatsappPhoneNumberId: string | null;
  whatsappAccessTokenConfigured: boolean;
  invoiceProvider: string | null;
  invoiceCredentialsConfigured: boolean;
  shippingProvider: string | null;
  shippingCredentialsConfigured: boolean;
}

export default async function IntegrationsPage() {
  const integration = (await serverApiFetch("/integrations/me")) as IntegrationsMeResponse;

  return (
    <main style={{ padding: "2rem 1rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>Entegrasyonlar</h1>
      <p>Buraya girilen API anahtarları veritabanında şifreli olarak saklanır.</p>

      <section style={{ marginTop: "2rem" }}>
        <h2>WhatsApp Cloud API</h2>
        <p>Numara: {integration.whatsappPhoneNumberId ?? "tanımlı değil"}</p>
        <p>Erişim token'ı: {integration.whatsappAccessTokenConfigured ? "tanımlı ✓" : "tanımlı değil"}</p>
        <form action={updateWhatsApp} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 360 }}>
          <input name="whatsappPhoneNumberId" placeholder="phone_number_id" />
          <input name="whatsappAccessToken" placeholder="Erişim token'ı (Meta System User)" type="password" />
          <button type="submit">Kaydet</button>
        </form>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Paraşüt (e-fatura)</h2>
        <p>Durum: {integration.invoiceCredentialsConfigured ? "tanımlı ✓" : "tanımlı değil"}</p>
        <form action={updateParasut} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 360 }}>
          <input name="clientId" placeholder="Client ID" required />
          <input name="clientSecret" placeholder="Client Secret" type="password" required />
          <input name="companyId" placeholder="Company ID" required />
          <input name="accessToken" placeholder="Access Token" type="password" required />
          <button type="submit">Kaydet</button>
        </form>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Shipentegra (kargo)</h2>
        <p>Durum: {integration.shippingCredentialsConfigured ? "tanımlı ✓" : "tanımlı değil"}</p>
        <form action={updateShipentegra} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 360 }}>
          <input name="apiKey" placeholder="API Key" required />
          <input name="apiSecret" placeholder="API Secret" type="password" required />
          <button type="submit">Kaydet</button>
        </form>
      </section>
    </main>
  );
}
