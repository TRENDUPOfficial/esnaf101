"use server";

import { revalidatePath } from "next/cache";
import { adminApiFetch } from "../../lib/api";

export async function setTenantStatus(tenantId: string, status: "active" | "suspended") {
  await adminApiFetch(`/admin/tenants/${tenantId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  revalidatePath("/tenants");
  revalidatePath(`/tenants/${tenantId}`);
}

export async function assignSubscription(tenantId: string, formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const activeUntil = String(formData.get("activeUntil") ?? "");
  if (!planId || !activeUntil) return;

  await adminApiFetch(`/admin/tenants/${tenantId}/subscription`, {
    method: "POST",
    body: JSON.stringify({ planId, activeUntil: new Date(activeUntil).toISOString() }),
  });
  revalidatePath(`/tenants/${tenantId}`);
}
