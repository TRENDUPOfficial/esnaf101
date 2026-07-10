"use server";

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "../../../lib/server-api";

function strOrUndefined(formData: FormData, key: string): string | undefined {
  const v = String(formData.get(key) ?? "").trim();
  return v || undefined;
}

export async function updateWhatsApp(formData: FormData) {
  await serverApiFetch("/integrations/me", {
    method: "PATCH",
    body: JSON.stringify({
      whatsappPhoneNumberId: strOrUndefined(formData, "whatsappPhoneNumberId"),
      whatsappAccessToken: strOrUndefined(formData, "whatsappAccessToken"),
    }),
  });
  revalidatePath("/integrations");
}

export async function updateParasut(formData: FormData) {
  const clientId = strOrUndefined(formData, "clientId");
  const clientSecret = strOrUndefined(formData, "clientSecret");
  const companyId = strOrUndefined(formData, "companyId");
  const accessToken = strOrUndefined(formData, "accessToken");
  if (!clientId || !clientSecret || !companyId || !accessToken) return;

  await serverApiFetch("/integrations/me", {
    method: "PATCH",
    body: JSON.stringify({
      invoiceProvider: "parasut",
      invoiceCredentials: { clientId, clientSecret, companyId, accessToken },
    }),
  });
  revalidatePath("/integrations");
}

export async function updateShipentegra(formData: FormData) {
  const apiKey = strOrUndefined(formData, "apiKey");
  const apiSecret = strOrUndefined(formData, "apiSecret");
  if (!apiKey || !apiSecret) return;

  await serverApiFetch("/integrations/me", {
    method: "PATCH",
    body: JSON.stringify({
      shippingProvider: "shipentegra",
      shippingCredentials: { apiKey, apiSecret },
    }),
  });
  revalidatePath("/integrations");
}
