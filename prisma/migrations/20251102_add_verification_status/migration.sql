BEGIN;

ALTER TABLE verification_documents
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL;

ALTER TABLE verification_documents
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

ALTER TABLE verification_documents
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP(3);

ALTER TABLE verification_documents
  ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

COMMIT;
