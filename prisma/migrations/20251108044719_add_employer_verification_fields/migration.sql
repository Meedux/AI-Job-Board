/*
  Warnings:

  - A unique constraint covering the columns `[short_url]` on the table `jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "company_size" TEXT,
ADD COLUMN     "founded_year" INTEGER,
ADD COLUMN     "legal_entity_type" TEXT,
ADD COLUMN     "official_name" TEXT,
ADD COLUMN     "primary_contact_email" TEXT,
ADD COLUMN     "tin" TEXT;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "qr_image_path" TEXT,
ADD COLUMN     "short_url" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authorized_rep_email_validated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tin" TEXT,
ADD COLUMN     "verification_status" TEXT DEFAULT 'unverified';

-- CreateIndex
CREATE UNIQUE INDEX "jobs_short_url_key" ON "jobs"("short_url");
