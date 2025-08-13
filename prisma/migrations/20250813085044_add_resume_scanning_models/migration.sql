-- CreateTable
CREATE TABLE "parsed_resumes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "application_id" TEXT,
    "original_file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" TEXT NOT NULL,
    "parsing_service" TEXT NOT NULL DEFAULT 'resumeparser',
    "parsing_job_id" TEXT,
    "parsing_status" TEXT NOT NULL DEFAULT 'pending',
    "parsing_error" TEXT,
    "raw_parsed_data" JSONB,
    "structured_data" JSONB,
    "personal_info" JSONB,
    "summary" TEXT,
    "experience" JSONB,
    "education" JSONB,
    "skills" TEXT[],
    "certifications" JSONB,
    "languages" JSONB,
    "projects" JSONB,
    "awards" JSONB,
    "references" JSONB,
    "total_experience_years" INTEGER,
    "experience_level" TEXT,
    "resume_quality_score" INTEGER,
    "completeness_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parsed_resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_scan_results" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "scan_type" TEXT NOT NULL,
    "overall_match" INTEGER NOT NULL,
    "skills_match" INTEGER NOT NULL,
    "experience_match" INTEGER NOT NULL,
    "education_match" INTEGER NOT NULL,
    "keyword_match" INTEGER NOT NULL,
    "matched_skills" TEXT[],
    "missing_skills" TEXT[],
    "experience_gap" INTEGER,
    "salary_fit" TEXT,
    "location_fit" BOOLEAN,
    "ai_recommendation" TEXT,
    "ai_reasoning" TEXT,
    "ai_key_points" TEXT[],
    "custom_criteria" JSONB,
    "scan_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scan_settings" JSONB,

    CONSTRAINT "resume_scan_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_job_matches" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "match_score" INTEGER NOT NULL,
    "match_ranking" INTEGER NOT NULL,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "skill_compatibility" INTEGER NOT NULL,
    "experience_compatibility" INTEGER NOT NULL,
    "education_compatibility" INTEGER NOT NULL,
    "location_compatibility" INTEGER NOT NULL,
    "salary_compatibility" INTEGER NOT NULL,
    "matched_requirements" TEXT[],
    "missing_requirements" TEXT[],
    "additional_skills" TEXT[],
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "resume_job_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_scan_criteria" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "skills_weight" INTEGER NOT NULL DEFAULT 30,
    "experience_weight" INTEGER NOT NULL DEFAULT 25,
    "education_weight" INTEGER NOT NULL DEFAULT 20,
    "keyword_weight" INTEGER NOT NULL DEFAULT 15,
    "location_weight" INTEGER NOT NULL DEFAULT 10,
    "min_experience_years" INTEGER,
    "required_education" TEXT,
    "must_have_skills" TEXT[],
    "nice_to_have_skills" TEXT[],
    "deal_breakers" TEXT[],
    "keyword_phrases" TEXT[],
    "exclude_keywords" TEXT[],
    "enable_ai_scanning" BOOLEAN NOT NULL DEFAULT true,
    "ai_model" TEXT DEFAULT 'gpt-4',
    "custom_prompt" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_scan_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resume_scan_results_resume_id_job_id_key" ON "resume_scan_results"("resume_id", "job_id");

-- CreateIndex
CREATE UNIQUE INDEX "resume_job_matches_resume_id_job_id_key" ON "resume_job_matches"("resume_id", "job_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_scan_criteria_job_id_key" ON "job_scan_criteria"("job_id");

-- AddForeignKey
ALTER TABLE "parsed_resumes" ADD CONSTRAINT "parsed_resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parsed_resumes" ADD CONSTRAINT "parsed_resumes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_scan_results" ADD CONSTRAINT "resume_scan_results_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "parsed_resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_scan_results" ADD CONSTRAINT "resume_scan_results_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_job_matches" ADD CONSTRAINT "resume_job_matches_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "parsed_resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_job_matches" ADD CONSTRAINT "resume_job_matches_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_scan_criteria" ADD CONSTRAINT "job_scan_criteria_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
