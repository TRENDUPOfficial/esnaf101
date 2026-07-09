import { Type } from "class-transformer";
import { IsNumber, IsString, Min } from "class-validator";

export class AssignPriceDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}
