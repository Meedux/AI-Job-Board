-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_token" TEXT,
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "enable_two_factor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "two_factor_backup_codes" JSONB,
ADD COLUMN     "two_factor_secret" TEXT;
