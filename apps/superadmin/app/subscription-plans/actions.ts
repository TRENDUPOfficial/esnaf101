"use server";

import { revalidatePath } from "next/cache";
import { adminApiFetch } from "../../lib/api";

export async function createPlan(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const monthlyPrice = String(formData.get("monthlyPrice") ?? "").trim();
  const orderLimit = String(formData.get("orderLimit") ?? "").trim();
  if (!name || !monthlyPrice) return;

  await adminApiFetch("/admin/subscription-plans", {
    method: "POST",
    body: JSON.stringify({
      name,
      monthlyPrice: Number(monthlyPrice),
      orderLimit: orderLimit ? Number(orderLimit) : undefined,
    }),
  });
  revalidatePath("/subscription-plans");
}
