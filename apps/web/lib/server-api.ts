import { auth } from "@clerk/nextjs/server";
import { apiFetch } from "./api";

/** Server Component / Server Action içinden apps/api'ye tenant token'ıyla istek atar. */
export async function serverApiFetch(path: string, init?: RequestInit) {
  const { getToken } = await auth();
  const token = await getToken();
  return apiFetch(path, token, init);
}
