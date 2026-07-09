"use server";

import { redirect } from "next/navigation";
import { setAdminToken } from "../../lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    redirect("/login?error=1");
  }

  const { token } = (await res.json()) as { token: string };
  await setAdminToken(token);
  redirect("/");
}
