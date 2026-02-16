-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyTargetNet" DOUBLE PRECISION,
ADD COLUMN     "hasWeeklyPlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workDaysPerWeek" INTEGER;
