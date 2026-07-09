"use server";

import { redirect } from "next/navigation";
import { setAdminToken } from "../../lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface LoginStageResult {
  ok: boolean;
  error?: string;
  stage?: "setup" | "verify";
  tempToken?: string;
  otpAuthUrl?: string;
  secret?: string;
}

/**
 * PLANNING.md Adım 9: 2FA zorunlu. Şifre doğru olsa bile burada asla tam
 * yetkili bir oturum verilmez — sadece kısa ömürlü bir `tempToken` ile bir
 * sonraki adımın hangisi olduğu (`setup`: ilk giriş, TOTP kurulumu gerekli;
 * `verify`: 2FA zaten aktif, sadece kod istenir) döner.
 */
export async function requestLogin(email: string, password: string): Promise<LoginStageResult> {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return { ok: false, error: "E-posta veya şifre hatalı" };
  }

  const data = (await res.json()) as Omit<LoginStageResult, "ok" | "error">;
  return { ok: true, ...data };
}

export async function confirmCode(tempToken: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${API_URL}/admin/auth/confirm-2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempToken, code }),
  });

  if (!res.ok) {
    return { ok: false, error: "Doğrulama kodu hatalı veya süresi doldu" };
  }

  const { token } = (await res.json()) as { token: string };
  await setAdminToken(token);
  redirect("/");
}
