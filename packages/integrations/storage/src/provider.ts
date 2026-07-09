export interface UploadObjectParams {
  key: string;
  buffer: Buffer;
  contentType: string;
}

export interface UploadObjectResult {
  url: string;
}

/**
 * Ekran görüntüleri gibi dosyaların yükleneceği obje depolamadan bağımsız
 * ortak arayüz (bkz. PLANNING.md "Dosya depolama" mimari kararı — S3 uyumlu,
 * örn. Cloudflare R2).
 */
export interface ObjectStorage {
  upload(params: UploadObjectParams): Promise<UploadObjectResult>;
}
