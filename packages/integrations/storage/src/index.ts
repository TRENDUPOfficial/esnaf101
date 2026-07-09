import { LocalObjectStorage } from "./local";
import { S3ObjectStorage } from "./s3";
import type { ObjectStorage } from "./provider";

export * from "./provider";
export * from "./s3";
export * from "./local";

/**
 * `.env`deki `S3_*` değişkenleri tanımlıysa S3 uyumlu depolamayı (R2), tanımlı
 * değilse yerel disk adaptörünü kullanır. Böylece gerçek R2 kimlik bilgileri
 * olmadan da geliştirme ortamında ekran görüntüsü yükleme akışı uçtan uca
 * test edilebilir.
 */
export function createObjectStorageFromEnv(env: NodeJS.ProcessEnv = process.env): ObjectStorage {
  const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET } = env;

  if (S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY && S3_BUCKET) {
    return new S3ObjectStorage({
      endpoint: S3_ENDPOINT,
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      bucket: S3_BUCKET,
    });
  }

  return new LocalObjectStorage({
    dir: env.LOCAL_STORAGE_DIR ?? ".local-storage",
    publicUrlBase: env.LOCAL_STORAGE_PUBLIC_URL ?? "http://localhost:3001/uploads",
  });
}
