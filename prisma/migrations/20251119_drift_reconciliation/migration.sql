-- Drift Reconciliation Migration (2025-11-19)
-- PURPOSE: Align migration history with current database state WITHOUT applying destructive changes.
-- The database already contains:
--  - employer_type_requirements table
--  - Added columns to jobs: dmw_mandatory_statement, is_sea_based, land_based_country,
--    land_based_license_number, placement_fee_currency, placement_fee_notes, vessel_flag,
--    vessel_name, vessel_type
--  - Added column to users: authorized_rep_email
--  - Modified verification_documents columns & foreign keys (file_type, notes, created_at, updated_at,
--    reviewer relations, required user_id, removed legacy columns)
--
-- This migration is intentionally NON-OPERATIVE (no DDL executed) to record the drift resolution.
-- If you need to recreate schema elsewhere, ensure earlier migrations plus these structural changes exist.
-- Future resets will apply this migration (which does nothing) AFTER prior ones.
-- To apply as 'already executed' without running SQL use:
--   npx prisma migrate resolve --applied 20251119_drift_reconciliation
-- If you prefer explicit idempotent DDL, replace the NO-OP section with IF NOT EXISTS statements.

-- NO-OP: baseline reconciliation

/*
Example idempotent statements (commented out):

CREATE TABLE IF NOT EXISTS employer_type_requirements (
  id TEXT PRIMARY KEY,
  employer_type_id TEXT NOT NULL REFERENCES employer_types(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  required BOOLEAN DEFAULT TRUE,
  schema JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS employer_type_requirements_employer_type_id_code_idx ON employer_type_requirements(employer_type_id, code);

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS dmw_mandatory_statement TEXT,
  ADD COLUMN IF NOT EXISTS is_sea_based BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS land_based_country TEXT,
  ADD COLUMN IF NOT EXISTS land_based_license_number TEXT,
  ADD COLUMN IF NOT EXISTS placement_fee_currency TEXT,
  ADD COLUMN IF NOT EXISTS placement_fee_notes TEXT,
  ADD COLUMN IF NOT EXISTS vessel_flag TEXT,
  ADD COLUMN IF NOT EXISTS vessel_name TEXT,
  ADD COLUMN IF NOT EXISTS vessel_type TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS authorized_rep_email TEXT;

-- verification_documents adjustments omitted for brevity; handle manually if needed.
*/
