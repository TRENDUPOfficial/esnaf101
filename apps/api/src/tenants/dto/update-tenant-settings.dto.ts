import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

/**
 * Tüm alanlar isteğe bağlı — IBAN/stok takibi zorunlu bir onboarding adımı
 * değil, panelin Entegrasyonlar sayfasından istenildiği zaman girilip
 * güncellenebilen ayarlar (bkz. PLANNING.md, satıcının IBAN'ı müşteriye
 * WhatsApp üzerinden ödeme talimatı olarak gönderiliyor). Boş bırakılan
 * alanlar isteğe hiç dahil edilmeyip mevcut değer korunmalı — bkz.
 * apps/web/app/(app)/integrations/actions.ts.
 */
export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsBoolean()
  stockTrackingEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^TR\d{24}$/, { message: "iban geçerli bir Türkiye IBAN'ı olmalı (TR + 24 rakam)" })
  iban?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  ibanAccountHolder?: string;
}
