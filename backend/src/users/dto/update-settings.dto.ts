import {
   IsBoolean,
   IsInt,
   IsNumber,
   IsOptional,
   Max,
   Min,
} from "class-validator";

export class UpdateSettingsDto {
   @IsOptional()
   @IsNumber()
   @Min(0)
   dailyTargetNet?: number | null;

   @IsOptional()
   @IsInt()
   @Min(1)
   @Max(7)
   workDaysPerWeek?: number | null;

   @IsOptional()
   @IsBoolean()
   hasWeeklyPlan?: boolean;
}
