-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "allow_preview" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "application_deadline" TIMESTAMP(3),
ADD COLUMN     "application_email" TEXT,
ADD COLUMN     "application_method" TEXT DEFAULT 'internal',
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Philippines',
ADD COLUMN     "education_attainment" TEXT,
ADD COLUMN     "employer_type" TEXT,
ADD COLUMN     "employment_type" TEXT,
ADD COLUMN     "external_application_url" TEXT,
ADD COLUMN     "generate_qr_code" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "generate_social_template" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "license_expiration_date" TIMESTAMP(3),
ADD COLUMN     "license_number" TEXT,
ADD COLUMN     "mode" TEXT,
ADD COLUMN     "number_of_openings" INTEGER DEFAULT 1,
ADD COLUMN     "overseas_statement" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "protect_email_address" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "salary_period" TEXT,
ADD COLUMN     "salary_range" TEXT,
ADD COLUMN     "show_compensation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_contact_on_posting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "sub_industry" TEXT;
