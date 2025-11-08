# DB Migration & Schema Design Plan

Purpose:
- Capture exact Prisma schema changes, rationale, migration steps, rollback plan, and acceptance criteria for employer-type / verification / company / document and job-related schema updates.

Scope (high-level):
- Add fields/relations to `User` to track employer type and verification metadata
- Harden `Company` model with official fields and document relation
- Add `Document` model (verification uploads) for a consistent audit trail
- Add or confirm Job fields (functionalRole, specialization, course, region, shortUrl, qrImagePath)
- Provide migration SQL and step-by-step plan for `prisma migrate` + zero-downtime considerations

Assumptions:
- Project uses Prisma with PostgreSQL (confirmed in repo).
- Current `prisma/schema.prisma` already has `Job`, `User`, `Company`, and `VerificationDocument` models; we will harmonize and create a new, canonical `Document` model only if needed.
- We'll avoid destructive renames in a single step; where fields are renamed, plan for a two-step migration (add new column, backfill, switch code, then drop old column later).

Proposed Prisma changes (suggested additions, not yet applied):

1) User model additions (non-breaking additive):

- employer_type: String?        // e.g. 'employer', 'agency'
- employer_category: String?    // e.g. 'single', 'group'
- employer_subtype: String?     // e.g. 'recruiter', 'direct'
- tin: String?                  // tax identification number
- verification_status: String?  // e.g. 'unverified' | 'pending' | 'verified' | 'rejected'
- authorized_rep_email_validated: Boolean @default(false)
- employer_type_id: Int?        // optional FK to EmployerType model if used

Prisma snippet:

// in model User
// Add below existing fields
employer_type         String?
employer_category     String?
employer_subtype      String?
tin                   String?
verification_status   String?   @default("unverified")
authorized_rep_email_validated Boolean @default(false)
employer_type_id      Int?    

// and optionally a relation
// employerType EmployerType? @relation(fields: [employer_type_id], references: [id])


2) Company model additions (additive):
- official_name String?
- tin String?
- legal_entity_type String? // e.g., 'company', 'individual'
- primary_contact_email String?
- documents relation to Document or VerificationDocument

Prisma snippet (company additions):

// in model Company
official_name       String?
tin                 String?
legal_entity_type   String? 
primary_contact_email String?
// documents VerificationDocument[] // or Document[] if we normalize


3) Document / VerificationDocument
- If `VerificationDocument` exists and is used across flows, ensure fields are standardized:
  - id Int @id @default(autoincrement())
  - type String        // 'company_registration', 'tin', 'id_card', etc.
  - url String        // storage or signed URL
  - status String     // 'pending','approved','rejected'
  - uploadedById Int -> User relation
  - reviewedById Int? -> User relation
  - notes String?
  - createdAt DateTime @default(now())
  - reviewedAt DateTime?

If not present, create `Document` model and migrate existing `VerificationDocument` rows into it in a follow-up.

4) Job additions (ensure fields exist or add):
- functionalRole String?
- specialization String?
- course String?
- region String?
- shortUrl String? @unique @map("short_url")
- qrImagePath String?  // store path to generated QR image

// example snippet in model Job
functionalRole String?
specialization String?
course String?
region String?
shortUrl String? @unique @map("short_url")
qrImagePath String?


Migration plan & steps (safe approach):

A. Design & Review
- Confirm the current `prisma/schema.prisma` exactly as checked into `master`.
- Review existing references to fields we plan to add/rename so we avoid breaking references.

B. Additive migration (step 1) — Add new columns only
- Update `prisma/schema.prisma` to add the new fields (all additions are nullable or have sensible defaults).
- Run `prisma migrate dev --name add-employer-and-doc-fields` in a local dev environment.
- Run app locally and verify no runtime errors and DB columns exist.
- Backfill critical data where possible (e.g., set `verification_status` based on `User.isVerified` if that boolean exists).

C. Backfill & Data Migration
- Write a small script (`scripts/backfill_verification_status.js`) that:
  - Reads current Users and sets `verification_status = 'verified'` when `isVerified` boolean is true, else 'unverified'
  - Migrates existing `VerificationDocument` data shape into new `Document` model if we created one.
- Run script in staging with a DB backup taken.

D. Code changes
- Update server code to use new fields (e.g., `verification_status` instead of `isVerified` if you plan to switch). Do this behind feature flag or in a single release where both are supported (read both until fully migrated).

E. Remove deprecated columns (two-step):
- After verification and code changes have stabilized and no code references old fields, add a migration to drop old columns.
- Run in staging and then production during a maintenance window.

Rollback plan:
- Before each migration run, create a DB dump / backup.
- If migration fails, restore database from backup.
- For destructive steps (drops, renames) perform them only after code no longer references old columns and after a rollback window expires.

Acceptance criteria:
- New columns exist in DB and are nullable/defaulted so application starts normally.
- Backfill script sets `verification_status` consistently in staging and passes smoke tests.
- Application can create and read `VerificationDocument` rows via the existing APIs.
- New job short link column exists and short-link generation API persists tokens successfully.

Operational notes:
- `prisma migrate` will create SQL migration files in `prisma/migrations/` which should be committed and reviewed.
- Ensure CI runs `prisma migrate deploy` on release if using that flow.

Next steps (what I will do if you want me to proceed now):
1. Apply the additive schema changes to `prisma/schema.prisma` (edit file). I will not run `prisma migrate` here unless you ask me to run commands in terminal.
2. Create a backfill script (under `scripts/`) to populate `verification_status` from existing `isVerified` if present.
3. Add migration notes and a checklist for staging rollout.

If you want me to proceed now, I will:
- Patch `prisma/schema.prisma` with the additive changes above (low-risk),
- Add `scripts/backfill_verification_status.js`, and
- Commit the changes so you can run `prisma migrate dev` locally (or I can run it in the terminal if you permit).

Choose: (A) Apply schema edits + backfill script now, or (B) I produce a file-by-file gap matrix first and then apply schema edits.  

---

Generated by the audit tasks; this file is a plan and not yet applied to the DB. Follow-up: confirm and I'll apply schema edits in the repo and prepare migration SQL.
