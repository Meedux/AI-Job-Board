/*
  Warnings:

  - You are about to drop the column `telegram_announcements` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_applications` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_job_alerts` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_messages` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_chat_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_enabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_username` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification_settings" DROP COLUMN "telegram_announcements",
DROP COLUMN "telegram_applications",
DROP COLUMN "telegram_job_alerts",
DROP COLUMN "telegram_messages";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "telegram_chat_id",
DROP COLUMN "telegram_enabled",
DROP COLUMN "telegram_username";
