import type { ReactNode } from "react";
import { AppShell } from "../../components/AppShell";
import { serverApiFetch } from "../../lib/server-api";

interface TenantMeResponse {
  tenant: { id: string; name: string; status: string };
  settings: { iban: string | null } | null;
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { tenant, settings } = (await serverApiFetch("/tenants/me")) as TenantMeResponse;

  return (
    <AppShell tenantName={tenant.name} showIbanReminder={!settings?.iban}>
      {children}
    </AppShell>
  );
}
