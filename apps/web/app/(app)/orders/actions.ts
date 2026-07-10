"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "../../../lib/server-api";

export async function assignPrice(orderId: string, formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const price = String(formData.get("price") ?? "");
  if (!productId || !price) return;

  await serverApiFetch(`/orders/${orderId}/assign-price`, {
    method: "PATCH",
    body: JSON.stringify({ productId, price: Number(price) }),
  });

  revalidatePath("/orders");
}

export async function markPaid(orderId: string) {
  await serverApiFetch(`/orders/${orderId}/mark-paid`, { method: "PATCH" });
  revalidatePath("/orders");
}
