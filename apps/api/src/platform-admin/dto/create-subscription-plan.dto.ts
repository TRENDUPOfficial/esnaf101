import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateSubscriptionPlanDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderLimit?: number;
}
