Migration & Deployment Runbook — Employer Verification and Employer Types

Overview
- This runbook describes how to apply the DB migrations related to Employer Types and Verification Documents and how to verify the application afterward.
- Always backup the production database before applying migrations.

Files added by the agent (review before running):
- prisma/migrations/20251102_add_employer_types/migration.sql
- prisma/migrations/20251102_add_verification_status/migration.sql
- prisma/migrations/20251102_add_taxid_to_users/migration.sql

High-level steps (PowerShell)
1) Backup production database (replace placeholders):

```powershell
$env:DATABASE_URL = 'postgresql://user:pass@db-host:5432/yourdb'
# Create pg_dump custom backup
pg_dump $env:DATABASE_URL --format=custom --file=backup_before_employer_verification.dump
```

2) Review the SQL files to confirm expectations:

```powershell
notepad prisma\migrations\20251102_add_employer_types\migration.sql
notepad prisma\migrations\20251102_add_verification_status\migration.sql
notepad prisma\migrations\20251102_add_taxid_to_users\migration.sql
```

3) Apply the SQL migrations directly using psql (manual apply):

```powershell
psql $env:DATABASE_URL -f prisma\migrations\20251102_add_employer_types\migration.sql
psql $env:DATABASE_URL -f prisma\migrations\20251102_add_verification_status\migration.sql
psql $env:DATABASE_URL -f prisma\migrations\20251102_add_taxid_to_users\migration.sql
```

4) Regenerate Prisma client locally or in your deployment step:

```powershell
npx prisma generate
```

Recommended (safer) approach: use Prisma Migrate (local dev & CI)
- On your local machine, with a copy of the production database or a staging DB, run:

```powershell
npx prisma migrate dev --name add_employer_verification
npx prisma generate
```

This will create a proper migration folder under `prisma/migrations` with SQL tailored to your schema and current DB state.

Post-migration verification (smoke tests)
1) Start the app locally (or your staging environment):
```powershell
npm install
npm run dev
```

2) Register or login as a super admin, navigate to `/admin/verification`.
3) As a sample employer, upload a small PDF via the employer profile UI and confirm the document appears in `/admin/verification`.
4) Approve the document as super admin and confirm the document record status changes to `verified`.
5) Create a job as an unverified employer — confirm behavior: unverified employers are limited to one non-closed posting (attempts to create the second posting should return a 403 error with a clear message).
6) Confirm `prisma generate` completed without errors and the app can read/write the new tables.

Rollback plan
- If something goes wrong immediately after applying the SQL files:
  1) Restore the DB from the backup made in step 1:
     ```powershell
     pg_restore --dbname=$env:DATABASE_URL --clean --if-exists backup_before_employer_verification.dump
     ```
  2) Redeploy the previous application build that matched the DB prior to the migration.

Notes and caveats
- The SQL files created by the agent are additive and use `ON DELETE SET NULL` for their FKs when applicable. They add columns and tables with conservative defaults.
- The agent did add code that relies on the new DB columns and endpoints. Deploy the backend changes (server code) together with the migration, otherwise runtime errors may occur.
- Tests are recommended on a staging DB before production rollout.

Next steps (optional, I can do these):
- Add Vercel Blob signed upload support (replace the proxy upload with direct S3-like signed URLs).
- Add automated tests for upload and admin review flows.
- Wire employer types UI (registration & job form) and finalize enforcement rules for contact reveals.

Contact
- If you want me to proceed with the rest of the todos (admin UI polish, enforcement, registration changes, tests), reply with confirmation and indicate whether to integrate Vercel Blob now or later.
