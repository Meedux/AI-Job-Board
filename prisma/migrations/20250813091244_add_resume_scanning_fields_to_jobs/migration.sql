-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "deal_breakers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "education_weight" INTEGER DEFAULT 20,
ADD COLUMN     "enable_ai_scanning" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "experience_weight" INTEGER DEFAULT 25,
ADD COLUMN     "keyword_weight" INTEGER DEFAULT 15,
ADD COLUMN     "location_weight" INTEGER DEFAULT 10,
ADD COLUMN     "min_experience_years" INTEGER,
ADD COLUMN     "required_education" TEXT,
ADD COLUMN     "skills_weight" INTEGER DEFAULT 30;
