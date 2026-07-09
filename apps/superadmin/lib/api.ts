import { getAdminToken } from "./session";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function adminApiFetch(path: string, init?: RequestInit) {
  const token = await getAdminToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API isteği başarısız (${res.status}): ${body}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
