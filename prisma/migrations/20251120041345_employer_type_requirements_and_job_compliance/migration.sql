/*
  Warnings:

  - You are about to drop the column `fileType` on the `verification_documents` table. All the data in the column will be lost.
  - You are about to drop the column `reviewer_notes` on the `verification_documents` table. All the data in the column will be lost.
  - You are about to drop the column `uploaded_at` on the `verification_documents` table. All the data in the column will be lost.
  - Added the required column `file_type` to the `verification_documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `verification_documents` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `verification_documents` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "verification_documents" DROP CONSTRAINT "verification_documents_user_id_fkey";

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "dmw_mandatory_statement" TEXT,
ADD COLUMN     "is_sea_based" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "land_based_country" TEXT,
ADD COLUMN     "land_based_license_number" TEXT,
ADD COLUMN     "placement_fee_currency" TEXT,
ADD COLUMN     "placement_fee_notes" TEXT,
ADD COLUMN     "vessel_flag" TEXT,
ADD COLUMN     "vessel_name" TEXT,
ADD COLUMN     "vessel_type" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authorized_rep_email" TEXT;

-- AlterTable
ALTER TABLE "verification_documents" DROP COLUMN "fileType",
DROP COLUMN "reviewer_notes",
DROP COLUMN "uploaded_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_type" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "user_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "employer_type_requirements" (
    "id" TEXT NOT NULL,
    "employer_type_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "schema" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_type_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employer_type_requirements_employer_type_id_code_key" ON "employer_type_requirements"("employer_type_id", "code");

-- AddForeignKey
ALTER TABLE "employer_type_requirements" ADD CONSTRAINT "employer_type_requirements_employer_type_id_fkey" FOREIGN KEY ("employer_type_id") REFERENCES "employer_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
