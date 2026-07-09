import { cookies } from "next/headers";

const COOKIE_NAME = "esnaf101_admin_token";

export async function getAdminToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function setAdminToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminToken(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
