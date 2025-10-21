-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN     "resume_alert_frequency" TEXT NOT NULL DEFAULT 'daily',
ADD COLUMN     "resume_education" TEXT,
ADD COLUMN     "resume_email_alerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "resume_experience_level" TEXT,
ADD COLUMN     "resume_keywords" TEXT[],
ADD COLUMN     "resume_location" TEXT,
ADD COLUMN     "resume_push_alerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "resume_salary_max" INTEGER,
ADD COLUMN     "resume_salary_min" INTEGER,
ADD COLUMN     "resume_skills" TEXT[];
