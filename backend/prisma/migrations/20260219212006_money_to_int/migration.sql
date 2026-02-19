/*
  Warnings:

  - You are about to alter the column `incomeTotal` on the `Day` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `costTotal` on the `Fueling` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `costTotal` on the `Other` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `costTotal` on the `Snack` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `costTotal` on the `Wash` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Day" ALTER COLUMN "incomeTotal" SET DEFAULT 0,
ALTER COLUMN "incomeTotal" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Fueling" ALTER COLUMN "costTotal" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Other" ALTER COLUMN "costTotal" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Snack" ALTER COLUMN "costTotal" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Wash" ALTER COLUMN "costTotal" SET DATA TYPE INTEGER;
