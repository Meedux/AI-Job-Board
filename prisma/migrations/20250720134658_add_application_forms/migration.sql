/*
  Warnings:

  - You are about to drop the column `user_id` on the `job_applications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[job_id,applicant_id]` on the table `job_applications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `applicant_id` to the `job_applications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "job_applications" DROP CONSTRAINT "job_applications_user_id_fkey";

-- DropIndex
DROP INDEX "job_applications_job_id_user_id_key";

-- AlterTable
ALTER TABLE "job_applications" DROP COLUMN "user_id",
ADD COLUMN     "applicant_id" TEXT NOT NULL,
ADD COLUMN     "application_data" JSONB,
ADD COLUMN     "file_data" JSONB,
ADD COLUMN     "form_id" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "application_forms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fields" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_forms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_forms_job_id_key" ON "application_forms"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_job_id_applicant_id_key" ON "job_applications"("job_id", "applicant_id");

-- AddForeignKey
ALTER TABLE "application_forms" ADD CONSTRAINT "application_forms_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_forms" ADD CONSTRAINT "application_forms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "application_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
