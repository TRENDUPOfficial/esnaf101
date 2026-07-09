import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, "esnaf101-tenant-integration-credentials", 32);
}

/**
 * Tenant entegrasyon API anahtarları (Parasut/Shipentegra/WhatsApp) gibi
 * hassas verileri veritabanına yazmadan önce şifrelemek için kullanılır.
 * `APP_ENCRYPTION_KEY` env değişkeni tüm servislerde (apps/api, apps/worker)
 * aynı olmalı, aksi halde bir serviste şifrelenen veri diğerinde çözülemez.
 */
export function encryptSecret(plaintext: string, secret = requireEncryptionKey()): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptSecret(ciphertext: string, secret = requireEncryptionKey()): string {
  const [ivB64, authTagB64, dataB64] = ciphertext.split(".");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Geçersiz şifrelenmiş değer formatı");
  }
  const key = deriveKey(secret);
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf-8");
}

export function encryptJson(value: unknown, secret?: string): string {
  return encryptSecret(JSON.stringify(value), secret);
}

export function decryptJson<T>(ciphertext: string, secret?: string): T {
  return JSON.parse(decryptSecret(ciphertext, secret)) as T;
}

function requireEncryptionKey(): string {
  const key = process.env.APP_ENCRYPTION_KEY;
  if (!key) throw new Error("APP_ENCRYPTION_KEY tanımlı değil");
  return key;
}
