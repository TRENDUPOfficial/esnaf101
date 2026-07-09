"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "../../lib/server-api";

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const listPrice = String(formData.get("listPrice") ?? "").trim();
  const stockQty = String(formData.get("stockQty") ?? "").trim();

  if (!name) return;

  await serverApiFetch("/products", {
    method: "POST",
    body: JSON.stringify({
      name,
      sku: sku || undefined,
      listPrice: listPrice ? Number(listPrice) : undefined,
      stockQty: stockQty ? Number(stockQty) : undefined,
    }),
  });

  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  await serverApiFetch(`/products/${productId}`, { method: "DELETE" });
  revalidatePath("/products");
}
