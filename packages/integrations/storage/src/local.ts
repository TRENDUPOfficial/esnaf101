import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ObjectStorage, UploadObjectParams, UploadObjectResult } from "./provider";

export interface LocalObjectStorageConfig {
  /** Dosyaların yazılacağı yerel dizin. */
  dir: string;
  /** Bu dizini HTTP üzerinden servis eden URL kökü (bkz. apps/api static serving). */
  publicUrlBase: string;
}

/**
 * S3/R2 kimlik bilgileri henüz tanımlanmamış geliştirme ortamları için yerel
 * disk üzerinde çalışan `ObjectStorage` adaptörü — yalnızca dev/test
 * amaçlıdır, üretimde `S3ObjectStorage` kullanılmalıdır.
 */
export class LocalObjectStorage implements ObjectStorage {
  constructor(private readonly config: LocalObjectStorageConfig) {}

  async upload({ key, buffer }: UploadObjectParams): Promise<UploadObjectResult> {
    const filePath = join(this.config.dir, key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    return { url: `${this.config.publicUrlBase}/${key}` };
  }
}
