import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsString, Min, MinLength } from "class-validator";

export class ServicePartDto {
   @IsString()
   @MinLength(1)
   name: string;

   @Type(() => Boolean)
   @IsBoolean()
   isOriginal: boolean;

   @Type(() => Number)
   @IsInt()
   @Min(0)
   unitCost: number;

   @Type(() => Number)
   @IsInt()
   @Min(1)
   quantity: number;
}
