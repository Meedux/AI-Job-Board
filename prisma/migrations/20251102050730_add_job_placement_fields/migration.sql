/*
  Warnings:

  - You are about to drop the column `created_at` on the `authorized_representatives` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `authorized_representatives` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `employer_types` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `employer_types` table. All the data in the column will be lost.
  - You are about to drop the column `employer_type` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `employer_type` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `file_type` on the `verification_documents` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `authorized_representatives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `employer_types` table without a default value. This is not possible if the table is not empty.
  - Made the column `is_placement` on table `jobs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `fileType` to the `verification_documents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "authorized_representatives" DROP CONSTRAINT "fk_ar_user";

-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "fk_jobs_employer_type";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "fk_users_employer_type";

-- DropForeignKey
ALTER TABLE "verification_documents" DROP CONSTRAINT "fk_vd_user";

-- DropIndex
DROP INDEX "idx_jobs_employer_type_id";

-- DropIndex
DROP INDEX "idx_users_employer_type_id";

-- AlterTable
ALTER TABLE "authorized_representatives" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "employer_types" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "employer_type",
ALTER COLUMN "placement_fee" DROP DEFAULT,
ALTER COLUMN "is_placement" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "employer_type";

-- AlterTable
ALTER TABLE "verification_documents" DROP COLUMN "file_type",
ADD COLUMN     "fileType" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employer_type_id_fkey" FOREIGN KEY ("employer_type_id") REFERENCES "employer_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employer_type_id_user_fkey" FOREIGN KEY ("employer_type_id_user") REFERENCES "employer_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorized_representatives" ADD CONSTRAINT "authorized_representatives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
