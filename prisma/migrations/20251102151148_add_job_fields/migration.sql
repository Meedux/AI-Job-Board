-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "course" TEXT,
ADD COLUMN     "functional_role" TEXT,
ADD COLUMN     "mandatory_statement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "principal_employer" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "valid_passport" BOOLEAN NOT NULL DEFAULT false;
