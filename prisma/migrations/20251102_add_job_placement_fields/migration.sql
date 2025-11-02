-- Migration: add_job_placement_fields
-- Adds placement_fee (numeric) and is_placement (boolean) to jobs table

BEGIN;

-- Add placement_fee with two decimal places. Default 0.00
ALTER TABLE "jobs"
ADD COLUMN IF NOT EXISTS "placement_fee" numeric(12,2) DEFAULT 0;

-- Add is_placement boolean flag. Default false
ALTER TABLE "jobs"
ADD COLUMN IF NOT EXISTS "is_placement" boolean DEFAULT false;

COMMIT;

-- Rollback (manual):
-- ALTER TABLE "jobs" DROP COLUMN IF EXISTS "placement_fee";
-- ALTER TABLE "jobs" DROP COLUMN IF EXISTS "is_placement";
