import { Type } from "class-transformer";
import {
   IsArray,
   IsInt,
   IsNumber,
   IsOptional,
   IsString,
   Min,
} from "class-validator";

export class CreateShiftDto {
   @IsString()
   date: string;

   @Type(() => Number)
   @IsInt()
   @Min(0)
   incomeTotal: number;

   @Type(() => Number)
   @IsInt()
   @Min(0)
   mileageKm: number;

   @Type(() => Number)
   @IsNumber()
   @Min(0)
   engineHours: number;

   @Type(() => Number)
   @IsInt()
   @Min(0)
   tripsCount: number;

   @IsOptional()
   @IsArray()
   @Type(() => Number)
   @IsInt({ each: true })
   @Min(0, { each: true })
   fuelings?: number[];

   @IsOptional()
   @IsArray()
   @Type(() => Number)
   @IsInt({ each: true })
   @Min(0, { each: true })
   washes?: number[];

   @IsOptional()
   @IsArray()
   @Type(() => Number)
   @IsInt({ each: true })
   @Min(0, { each: true })
   snacks?: number[];

   @IsOptional()
   @IsArray()
   @Type(() => Number)
   @IsInt({ each: true })
   @Min(0, { each: true })
   others?: number[];
}
