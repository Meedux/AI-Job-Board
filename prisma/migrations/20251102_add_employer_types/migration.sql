BEGIN;

-- Create normalized employer_types table
CREATE TABLE IF NOT EXISTS employer_types (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  updated_at TIMESTAMP(3) DEFAULT now() NOT NULL
);

-- Create authorized_representatives table
CREATE TABLE IF NOT EXISTS authorized_representatives (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  designation TEXT,
  phone TEXT,
  document_id TEXT,
  created_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  updated_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  CONSTRAINT fk_ar_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  category TEXT,
  CONSTRAINT fk_vd_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add employer_type_id to jobs (if it doesn't already exist)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS employer_type_id TEXT;

-- Add foreign key if it does not already exist (Postgres doesn't support ADD CONSTRAINT IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_jobs_employer_type'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT fk_jobs_employer_type FOREIGN KEY (employer_type_id) REFERENCES employer_types(id) ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_jobs_employer_type_id ON jobs(employer_type_id);

-- Add employer_type_id_user to users (if it doesn't already exist)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS employer_type_id_user TEXT;

-- Add foreign key if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_employer_type'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT fk_users_employer_type FOREIGN KEY (employer_type_id_user) REFERENCES employer_types(id) ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_users_employer_type_id ON users(employer_type_id_user);

COMMIT;
