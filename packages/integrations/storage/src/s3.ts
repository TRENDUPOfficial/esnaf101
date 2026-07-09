import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { ObjectStorage, UploadObjectParams, UploadObjectResult } from "./provider";

export interface S3ObjectStorageConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Bucket'a herkese açık erişim için kullanılan public URL kökü (endpoint'ten farklı olabilir). */
  publicUrlBase?: string;
  region?: string;
}

/**
 * S3 uyumlu obje depolama adaptörü (Cloudflare R2 için doğrulandı — R2, S3
 * API'sini birebir destekliyor). Bucket'ın herkese açık okuma erişimi
 * olduğu varsayılır (dev/MVP için); ileride imzalı URL üretimine
 * geçilebilir.
 */
export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly publicUrlBase: string;

  constructor(private readonly config: S3ObjectStorageConfig) {
    this.client = new S3Client({
      region: config.region ?? "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.publicUrlBase = config.publicUrlBase ?? `${config.endpoint}/${config.bucket}`;
  }

  async upload({ key, buffer, contentType }: UploadObjectParams): Promise<UploadObjectResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return { url: `${this.publicUrlBase}/${key}` };
  }
}
