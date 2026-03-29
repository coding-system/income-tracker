import { Type } from "class-transformer";
import {
   IsArray,
   IsInt,
   IsOptional,
   IsString,
   Min,
   ValidateNested,
} from "class-validator";
import { ServicePartDto } from "./service-part.dto";

export class CreateServiceVisitDto {
   @IsString()
   date: string;

   @Type(() => Number)
   @IsInt()
   @Min(0)
   mileageKm: number;

   @Type(() => Number)
   @IsInt()
   @Min(0)
   workCost: number;

   @IsOptional()
   @IsString()
   notes?: string;

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => ServicePartDto)
   parts: ServicePartDto[];
}
