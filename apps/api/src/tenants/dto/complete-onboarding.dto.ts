import { IsBoolean, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CompleteOnboardingDto {
  @IsBoolean()
  stockTrackingEnabled!: boolean;

  @IsString()
  @Matches(/^TR\d{24}$/, { message: "iban geçerli bir Türkiye IBAN'ı olmalı (TR + 24 rakam)" })
  iban!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  ibanAccountHolder!: string;
}
