import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  listPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQty?: number;
}
