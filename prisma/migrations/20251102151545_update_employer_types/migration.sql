/*
  Warnings:

  - Added the required column `category` to the `employer_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `employer_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employer_types" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subtype" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;
