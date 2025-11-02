Prisma migration: Add job placement fields

This migration adds two columns to the `jobs` table:
- `placement_fee` (numeric(12,2)) default 0.00
- `is_placement` (boolean) default false

PowerShell runbook (local development / staging):

1) Backup your DB (recommended):
   # Export database using pg_dump (adjust connection string as needed)
   $env:PGPASSWORD = '<DB_PASSWORD>'; pg_dump -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -Fc -f "backup_before_add_job_placement_fields.dump"

2) Apply migration using Prisma (recommended):
   # Ensure you have .env DATABASE_URL set locally
   npx prisma migrate dev --name add_job_placement_fields
   # Then regenerate the client
   npx prisma generate

   If you prefer to run raw SQL against the DB (e.g. in CI/production), you can run the SQL in prisma/migrations/20251102_add_job_placement_fields/migration.sql using psql:

   psql "${env:DATABASE_URL}" -f prisma/migrations/20251102_add_job_placement_fields/migration.sql

3) Post-migration checks:
   - Run a quick smoke test of your Next.js server and create a job with placementFee and isPlacement set to ensure no DB errors.
   - Verify the new columns exist:
     psql "${env:DATABASE_URL}" -c "\d+ jobs"

4) Rollback (if needed):
   - Restore the DB from the backup created in step 1, or run the rollback SQL (be careful, this will drop columns):
     ALTER TABLE "jobs" DROP COLUMN IF EXISTS "placement_fee";
     ALTER TABLE "jobs" DROP COLUMN IF EXISTS "is_placement";

Notes:
- We chose numeric(12,2) for currency-safe storage. If you prefer float, change the SQL to use real/double precision.
- Ensure your runtime Prisma schema (prisma/schema.prisma) matches these columns after running `npx prisma migrate dev` (it will update the schema automatically when using Prisma migrate dev).
