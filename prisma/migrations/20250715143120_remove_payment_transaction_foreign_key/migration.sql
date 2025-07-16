/*
  Warnings:

  - You are about to drop the column `max_job_applications` on the `subscription_plans` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payment_transactions" DROP CONSTRAINT "payment_transactions_related_id_fkey";

-- AlterTable
ALTER TABLE "credit_packages" ADD COLUMN     "addon_features" JSONB,
ADD COLUMN     "bundle_config" JSONB,
ADD COLUMN     "is_addon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validity_days" INTEGER;

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "description" TEXT,
ADD COLUMN     "receipt_url" TEXT,
ADD COLUMN     "refund_id" TEXT,
ADD COLUMN     "refunded_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "max_job_applications",
ADD COLUMN     "advanced_analytics" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "custom_branding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_ai_job_matches" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_direct_applications" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_featured_jobs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_job_postings" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_subscriptions" ADD COLUMN     "last_reset_at" TIMESTAMP(3),
ADD COLUMN     "used_ai_credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used_ai_job_matches" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used_direct_applications" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used_featured_jobs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used_job_postings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used_resume_views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "activity_data" JSONB,
    "credits_used" INTEGER NOT NULL DEFAULT 0,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_activities_user_id_activity_type_month_year_key" ON "user_activities"("user_id", "activity_type", "month", "year");

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
