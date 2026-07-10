import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { serverApiFetch } from "../../lib/server-api";

interface TenantMeResponse {
  tenant: { id: string; name: string; status: string };
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { tenant } = (await serverApiFetch("/tenants/me")) as TenantMeResponse;

  if (tenant.status === "pending_onboarding") {
    redirect("/onboarding/settings");
  }

  return <AppShell tenantName={tenant.name}>{children}</AppShell>;
}
