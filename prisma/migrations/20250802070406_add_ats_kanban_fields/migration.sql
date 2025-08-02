-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "contact_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "is_favorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "salary_expectation" DECIMAL(65,30),
ADD COLUMN     "source" TEXT DEFAULT 'direct',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "stage" SET DEFAULT 'new';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile_picture" TEXT,
ADD COLUMN     "resume_url" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);
