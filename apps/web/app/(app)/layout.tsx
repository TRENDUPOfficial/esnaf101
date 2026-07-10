import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

interface TenantMeResponse {
  tenant: { id: string; name: string; status: string };
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { getToken } = await auth();
  const token = await getToken();
  const { tenant } = (await apiFetch("/tenants/me", token)) as TenantMeResponse;

  if (tenant.status === "pending_onboarding") {
    redirect("/onboarding/settings");
  }

  return <AppShell tenantName={tenant.name}>{children}</AppShell>;
}
