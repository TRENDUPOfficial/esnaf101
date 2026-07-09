import { Type } from "class-transformer";
import { IsIn, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

class ParasutCredentialsDto {
  @IsString() clientId!: string;
  @IsString() clientSecret!: string;
  @IsString() companyId!: string;
  @IsString() accessToken!: string;
}

class ShipentegraCredentialsDto {
  @IsString() apiKey!: string;
  @IsString() apiSecret!: string;
}

export class UpdateIntegrationsDto {
  @IsOptional()
  @IsString()
  whatsappPhoneNumberId?: string;

  @IsOptional()
  @IsString()
  whatsappAccessToken?: string;

  @IsOptional()
  @IsIn(["parasut"])
  invoiceProvider?: "parasut";

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ParasutCredentialsDto)
  invoiceCredentials?: ParasutCredentialsDto;

  @IsOptional()
  @IsIn(["shipentegra"])
  shippingProvider?: "shipentegra";

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ShipentegraCredentialsDto)
  shippingCredentials?: ShipentegraCredentialsDto;
}
