import { auth } from "@clerk/nextjs/server";
import { apiFetch, ApiError } from "./api";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Server Component / Server Action içinden apps/api'ye tenant token'ıyla istek atar.
 *
 * Bir organizasyon yeni oluşturulduysa (onboarding akışı), Clerk'in o
 * organizasyonu oturuma "aktif" olarak işleyip token'a org claim'i eklemesi
 * bir anlık gecikebilir — bu durumda API "tenant seçilmemiş" (403) döner.
 * Server-side getToken() istemci tarafındaki gibi bir skipCache seçeneği
 * sunmuyor (her zaman taze token ister), o yüzden burada kısa bir bekleyip
 * bir kez daha deneme yapıyoruz — aksi halde kullanıcı organizasyon
 * oluşturduktan hemen sonra panelin çökmesiyle karşılaşır.
 */
export async function serverApiFetch(path: string, init?: RequestInit) {
  const { getToken } = await auth();
  const token = await getToken();
  try {
    return await apiFetch(path, token, init);
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      await sleep(750);
      const retryToken = await getToken();
      return apiFetch(path, retryToken, init);
    }
    throw err;
  }
}
