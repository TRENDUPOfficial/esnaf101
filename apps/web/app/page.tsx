import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { apiFetch } from "../lib/api";

interface TenantMeResponse {
  tenant: { id: string; name: string; status: string };
  settings: { stockTrackingEnabled: boolean } | null;
}

export default async function HomePage() {
  const { getToken } = await auth();
  const token = await getToken();
  const { tenant } = (await apiFetch("/tenants/me", token)) as TenantMeResponse;

  if (tenant.status === "pending_onboarding") {
    redirect("/onboarding/settings");
  }

  return (
    <main style={{ padding: "3rem 1rem" }}>
      <h1>Esnaf101 Satıcı Paneli</h1>
      <p>
        {tenant.name} — durum: {tenant.status}
      </p>
      <nav style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <Link href="/dashboard">Panel</Link>
        <Link href="/orders">Siparişler</Link>
        <Link href="/products">Ürünler</Link>
        <Link href="/customers">Müşteriler</Link>
        <Link href="/integrations">Entegrasyonlar</Link>
      </nav>
    </main>
  );
}
