-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hide_profile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "job_alerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_visibility" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN     "resume_alerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_sensitive_info" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegram_chat_id" TEXT,
ADD COLUMN     "telegram_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegram_username" TEXT;

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_alert_frequency" TEXT NOT NULL DEFAULT 'daily',
    "job_keywords" TEXT[],
    "job_locations" TEXT[],
    "job_types" TEXT[],
    "experience_levels" TEXT[],
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "remote_work" BOOLEAN,
    "job_categories" TEXT[],
    "hide_contact_info" BOOLEAN NOT NULL DEFAULT true,
    "hide_email" BOOLEAN NOT NULL DEFAULT true,
    "hide_phone" BOOLEAN NOT NULL DEFAULT true,
    "hide_address" BOOLEAN NOT NULL DEFAULT true,
    "account_status" TEXT NOT NULL DEFAULT 'active',
    "data_retention" BOOLEAN NOT NULL DEFAULT true,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "user_id" TEXT,
    "job_alerts" BOOLEAN NOT NULL DEFAULT true,
    "resume_alerts" BOOLEAN NOT NULL DEFAULT true,
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "announcements" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribe_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_job_alerts" BOOLEAN NOT NULL DEFAULT true,
    "email_resume_alerts" BOOLEAN NOT NULL DEFAULT true,
    "email_applications" BOOLEAN NOT NULL DEFAULT true,
    "email_messages" BOOLEAN NOT NULL DEFAULT true,
    "email_announcements" BOOLEAN NOT NULL DEFAULT true,
    "email_marketing" BOOLEAN NOT NULL DEFAULT false,
    "telegram_job_alerts" BOOLEAN NOT NULL DEFAULT false,
    "telegram_applications" BOOLEAN NOT NULL DEFAULT false,
    "telegram_messages" BOOLEAN NOT NULL DEFAULT false,
    "telegram_announcements" BOOLEAN NOT NULL DEFAULT false,
    "push_job_alerts" BOOLEAN NOT NULL DEFAULT true,
    "push_applications" BOOLEAN NOT NULL DEFAULT true,
    "push_messages" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_subscriptions_email_key" ON "email_subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_subscriptions_unsubscribe_token_key" ON "email_subscriptions"("unsubscribe_token");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_user_id_key" ON "notification_settings"("user_id");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
