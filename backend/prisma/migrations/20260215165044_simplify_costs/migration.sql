/*
  Warnings:

  - You are about to drop the column `note` on the `Fueling` table. All the data in the column will be lost.
  - You are about to drop the column `odometerKm` on the `Fueling` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Fueling` table. All the data in the column will be lost.
  - You are about to drop the column `volumeLiters` on the `Fueling` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Snack` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Snack` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Snack` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Wash` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Wash` table. All the data in the column will be lost.
  - You are about to drop the `EngineHours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mileage` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `costTotal` on table `Fueling` required. This step will fail if there are existing NULL values in that column.
  - Made the column `costTotal` on table `Snack` required. This step will fail if there are existing NULL values in that column.
  - Made the column `costTotal` on table `Wash` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "EngineHours" DROP CONSTRAINT "EngineHours_dayId_fkey";

-- DropForeignKey
ALTER TABLE "Mileage" DROP CONSTRAINT "Mileage_dayId_fkey";

-- AlterTable
ALTER TABLE "Day" ADD COLUMN     "engineHours" DOUBLE PRECISION,
ADD COLUMN     "mileageKm" INTEGER;

-- AlterTable
ALTER TABLE "Fueling" DROP COLUMN "note",
DROP COLUMN "odometerKm",
DROP COLUMN "time",
DROP COLUMN "volumeLiters",
ALTER COLUMN "costTotal" SET NOT NULL;

-- AlterTable
ALTER TABLE "Snack" DROP COLUMN "note",
DROP COLUMN "time",
DROP COLUMN "title",
ALTER COLUMN "costTotal" SET NOT NULL;

-- AlterTable
ALTER TABLE "Wash" DROP COLUMN "note",
DROP COLUMN "time",
ALTER COLUMN "costTotal" SET NOT NULL;

-- DropTable
DROP TABLE "EngineHours";

-- DropTable
DROP TABLE "Mileage";
