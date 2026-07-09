import { IsDateString, IsString } from "class-validator";

export class AssignSubscriptionDto {
  @IsString()
  planId!: string;

  @IsDateString()
  activeUntil!: string;
}
