/*
  Warnings:

  - You are about to drop the column `description` on the `ats_interviews` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `ats_interviews` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ats_interviews` table. All the data in the column will be lost.
  - The `feedback` column on the `ats_interviews` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ats_application_stages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ats_candidate_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ats_hiring_stages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ats_application_stages" DROP CONSTRAINT "ats_application_stages_application_id_fkey";

-- DropForeignKey
ALTER TABLE "ats_application_stages" DROP CONSTRAINT "ats_application_stages_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "ats_candidate_notes" DROP CONSTRAINT "ats_candidate_notes_application_id_fkey";

-- DropForeignKey
ALTER TABLE "ats_candidate_notes" DROP CONSTRAINT "ats_candidate_notes_author_id_fkey";

-- DropForeignKey
ALTER TABLE "ats_hiring_stages" DROP CONSTRAINT "ats_hiring_stages_job_id_fkey";

-- DropForeignKey
ALTER TABLE "ats_interviews" DROP CONSTRAINT "ats_interviews_interviewer_id_fkey";

-- AlterTable
ALTER TABLE "ats_interviews" DROP COLUMN "description",
DROP COLUMN "rating",
DROP COLUMN "title",
ADD COLUMN     "recording_url" TEXT,
ADD COLUMN     "score" INTEGER,
ALTER COLUMN "type" DROP DEFAULT,
DROP COLUMN "feedback",
ADD COLUMN     "feedback" JSONB;

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "decided_at" TIMESTAMP(3),
ADD COLUMN     "feedback" JSONB,
ADD COLUMN     "interviewed_at" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "scheduled_interviews" JSONB,
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'application';

-- DropTable
DROP TABLE "ats_application_stages";

-- DropTable
DROP TABLE "ats_candidate_notes";

-- DropTable
DROP TABLE "ats_hiring_stages";

-- AddForeignKey
ALTER TABLE "ats_interviews" ADD CONSTRAINT "ats_interviews_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
