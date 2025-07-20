-- AlterTable
ALTER TABLE "users" ADD COLUMN     "access_level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "account_status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "activated_at" TIMESTAMP(3),
ADD COLUMN     "activation_code" TEXT,
ADD COLUMN     "allocated_ai_credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "allocated_resume_credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "employer_type" TEXT,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "parent_user_id" TEXT,
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "used_ai_credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used_resume_credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_type" TEXT,
ALTER COLUMN "role" SET DEFAULT 'job_seeker';

-- CreateTable
CREATE TABLE "user_management" (
    "id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "managed_user_id" TEXT NOT NULL,
    "access_level" INTEGER NOT NULL DEFAULT 1,
    "permissions" JSONB,
    "credit_limits" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_exports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exported_by" TEXT NOT NULL,
    "resume_data" JSONB NOT NULL,
    "format" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER,
    "download_url" TEXT,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "shared_with" JSONB,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "target_date" TIMESTAMP(3),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ats_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_addons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "required_plan_types" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_addon_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "addon_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total_price" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMP(3),
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_addon_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_management_manager_id_managed_user_id_key" ON "user_management"("manager_id", "managed_user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management" ADD CONSTRAINT "user_management_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management" ADD CONSTRAINT "user_management_managed_user_id_fkey" FOREIGN KEY ("managed_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_exports" ADD CONSTRAINT "resume_exports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_activities" ADD CONSTRAINT "ats_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_addon_purchases" ADD CONSTRAINT "subscription_addon_purchases_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "subscription_addons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
