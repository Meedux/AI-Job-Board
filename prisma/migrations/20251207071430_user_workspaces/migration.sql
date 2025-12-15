-- CreateEnum
CREATE TYPE "PrescreenAccessMode" AS ENUM ('view_only', 'downloadable');

-- CreateEnum
CREATE TYPE "PrescreenStatus" AS ENUM ('active', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "AccessRequestStatus" AS ENUM ('pending', 'approved', 'denied');

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "unique_url_token" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "assigned_role" TEXT,
    "workspace_data" JSONB,
    "metadata" JSONB,
    "wiped_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescreen_interviews" (
    "id" TEXT NOT NULL,
    "application_id" TEXT,
    "job_id" TEXT,
    "candidate_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "blob_path" TEXT NOT NULL,
    "blob_url" TEXT NOT NULL,
    "download_url" TEXT,
    "access_mode" "PrescreenAccessMode" NOT NULL DEFAULT 'view_only',
    "expires_at" TIMESTAMP(3),
    "scheduling_link" TEXT,
    "status" "PrescreenStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescreen_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescreen_access_requests" (
    "id" TEXT NOT NULL,
    "interview_id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "message" TEXT,
    "status" "AccessRequestStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescreen_access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT,
    "location" TEXT,
    "salary_from" INTEGER,
    "salary_to" INTEGER,
    "salary_currency" TEXT,
    "salary_raw" TEXT,
    "description" TEXT,
    "source_url" TEXT,
    "source_host" TEXT,
    "normalized" JSONB,
    "signature" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "approved_by_id" TEXT,
    "published_job_id" TEXT,
    "created_by_id" TEXT,

    CONSTRAINT "imported_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_unique_url_token_key" ON "workspaces"("unique_url_token");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescreen_interviews" ADD CONSTRAINT "prescreen_interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescreen_interviews" ADD CONSTRAINT "prescreen_interviews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescreen_interviews" ADD CONSTRAINT "prescreen_interviews_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescreen_interviews" ADD CONSTRAINT "prescreen_interviews_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescreen_access_requests" ADD CONSTRAINT "prescreen_access_requests_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "prescreen_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescreen_access_requests" ADD CONSTRAINT "prescreen_access_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imported_jobs" ADD CONSTRAINT "imported_jobs_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imported_jobs" ADD CONSTRAINT "imported_jobs_published_job_id_fkey" FOREIGN KEY ("published_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imported_jobs" ADD CONSTRAINT "imported_jobs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
