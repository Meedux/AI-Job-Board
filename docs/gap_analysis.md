# Requirements Gap Analysis — Employer Verification & Posting

Generated: 2025-11-08

This document maps each high-level requirement (from the todo list) to the files in the repository that implement the feature, and notes gaps / missing pieces and recommended next steps. Use this as the authoritative checklist before applying DB migrations and further changes.

---

## Summary (high level)
- Many verification and employer-related features are already implemented across the stack: upload prepare + proxy, admin review queue, profile employer API and UI, server-side posting limits for unverified accounts, and job-side flags (generateQRCode, generateSocialTemplate, functionalRole, specialization, course, region, placement fields, etc.).
- Missing pieces are primarily glue and UX: persistent QR images & download endpoints, short link resolve redirects (added), front-end controls for generating/regenerating short links in employer dashboard, canonical DB migration scripts applied, and tests/CI migration checks.

---

## File-to-requirements matrix

Note: status values: Implemented / Partial / Missing

1) Registration & Email Verification
- Files / locations:
  - `app/api/auth/register-enhanced/route.js` — generates email verification token and sends verification email via `emailItService` (implemented).
  - `utils/externalEmailService.js` — email delivery utilities (implemented).
  - `components/DynamicAuthForm.js` — handles email verification responses and redirects users to verification flows (implemented).
- Status: Implemented
- Gaps: None major. Consider adding E2E tests for email verification flows and an expiration/refresh flow for tokens.


2) Employer Types (normalized employer types, role enforcement)
- Files / locations:
  - `prisma/schema.prisma` — `EmployerType` model exists (implemented).
  - `prisma/schema.prisma` — `User` has `employerTypeUser` relation and `employerTypeId`, `employerCategory` (implemented)
  - Code references: some checks in `components/ComprehensiveJobPostingForm.js` derive flags from `user.companyType` / `user.employerCategory` and `employerTypeUser` (implemented partially at UI level).
- Status: Partial
- Gaps:
  - Enforcement and normalization are present, but there are places where legacy `employerType`/`companyType` references exist; we should standardize on `EmployerType` relation and remove deprecated fields in a planned migration.
  - Need server-side validation rules for employer type-specific behaviors centralized in APIs (e.g., determining `canSetPlacementFee` server-side for job creation/update). Right now enforcement exists in `comprehensive-post` route (placement restrictions) but some rules are duplicated in UI and should be consolidated.


3) Verification Upload & Admin Review
- Files / locations:
  - `app/api/verification/upload/prepare/route.js` — prepare upload, creates `VerificationDocument` row and returns direct upload URL or proxy key (implemented).
  - `app/api/verification/upload/proxy/[key]/route.js` — proxy handler updates `VerificationDocument` url after upload (implemented).
  - `app/api/admin/verification/route.js` — admin list for verification queue (implemented).
  - `app/api/admin/verification/[id]/route.js` — approve/reject flows; sets `User.isVerified`, sends email notifications and creates in-app notifications (implemented).
  - `app/profile/employer/page.js` — employer UI for uploading docs (implemented).
  - `prisma/schema.prisma` — `VerificationDocument` model (implemented).
- Status: Implemented
- Gaps:
  - Audit logging exists partially (reviewer notes and reviewedAt saved). Consider adding full audit trail entries as separate table for immutable audit logs.
  - SuperAdmin UI page exists (`app/admin/verification/page.js`) — verify UX and test flows.


4) Employer Profile & Manage Company
- Files / locations:
  - `app/api/profile/employer/route.js` — GET/PUT to return and update profile, include companies, verification docs, authorized reps (implemented).
  - `app/profile/employer/page.js` — UI for profile + uploading verification docs (implemented).
  - `components/ComprehensiveJobPostingForm.js` — links to manage-company and uses `user.companyName` (implemented in form and profile flow)
  - `utils/db.js` — company helpers like `companies.findMany`, `upsert` (implemented)
- Status: Partial
- Gaps:
  - Manage Company pages (more advanced CRUD UI, company documents viewer, alphabetical company dropdown in job form) need polish and linking. There is a `manage-company` path referenced but ensure it exists and supports document upload/preview.
  - Company model may need official fields (official_name, tin) as documented in migration plan.


5) Job Posting (Comprehensive)
- Files / locations:
  - `components/ComprehensiveJobPostingForm.js` — rich multi-step form with employer-specific fields (implemented)
  - `app/api/jobs/comprehensive-post/route.js` — POST endpoint that enforces posting limits and placement restrictions for unverified accounts; creates job and ApplicationForm (implemented)
  - `utils/db.js` — job creation helpers (implemented)
- Status: Implemented (core)
- Gaps:
  - Need server-side consolidation of employer-type rule checks (some checks exist in the route; consider factoring into shared utility to keep parity with UI logic).
  - `shortUrl` persistence is added to Prisma schema and comprehensive-post route now stores `shortUrl` if provided — migration must be applied.


6) Job Listing, Cards & Preview
- Files / locations:
  - `utils/db.js` — `jobs.findMany`, `findBySlug` (includes `postedBy.verificationDocuments` to infer `company_verified`) (implemented)
  - `components/JobCard.js`, `components/JobPreview.js`, `components/JobDetailModal.js` — UI components showing job content and `company_verified` status (partial)
- Status: Partial
- Gaps:
  - Job card & preview show QR and social template toggles but no persisted generated QR images or short-link display in the UI. Need to add controls to employer dashboard to generate/regenerate and download QR (front-end + backend endpoints for QR image storage).
  - Ensure badge, placement tooltip, principal/employer display are uniformly present across card, preview, and modal.


7) Short links & QR codes
- Files / locations:
  - `prisma/schema.prisma` — `Job.shortUrl` field added (file shows it) (schema edit applied to file but not migrated to DB)
  - `app/api/jobs/[id]/shortlink/route.js` — API to generate/regenerate token (added in session)
  - `app/api/s/[token]/route.js` — redirect resolver (added in session)
  - `components/JobPreview.js` and `components/JobCard.js` — references to generate QR (UI uses `generateQRCode` flag) (partial)
- Status: Partial
- Gaps:
  - Persisted QR image generation is missing. There is a `generateQRCode` boolean, but server-side generation and storage (e.g., saving PNG to `public/uploads/qrs` or blob) and a download endpoint are missing.
  - Front-end employer actions to call the shortlink API, show the generated short link, regenerate, and display QR are missing.
  - Prisma migration must be executed to add `short_url` column to DB before runtime uses it.


8) Search / Indexing & Resume DB
- Files / locations:
  - `utils/db.js` — job search filters exist and include title, description, company name, and basic filters (partial)
  - `prisma/schema.prisma` — resume scanning models and job-scan models exist (implemented)
  - `app/api/resume/*` — reveal contact route and other resume APIs exist (partial)
- Status: Partial
- Gaps:
  - Need to update search indexing and filters for new fields (functionalRole, specialization, course, region, employer type). If using an external index (Algolia, ElasticSearch), mappings & indexing jobs must be updated.
  - WFH vs Remote distinctions need to be normalized in DB and search facets.


9) SuperAdmin verification UI & notifications
- Files / locations:
  - `app/admin/verification/page.js` — admin review UI (implemented)
  - `app/api/admin/verification/*.js` — admin endpoints (implemented)
  - Notification creation uses `createNotification` and `emailItService` (implemented)
- Status: Implemented
- Gaps:
  - Audit logs beyond reviewerNotes are limited to the `VerificationDocument` reviewer fields. Consider separate audit table for compliance.


10) Business Rules Enforcement (verification-based)
- Files / locations:
  - `app/api/jobs/comprehensive-post/route.js` — enforces posting limits for unverified accounts and placement restrictions (implemented)
  - `app/api/resume/reveal-contact/route.js` — denies resume reveal for unverified employers (implemented)
  - UI: `components/ComprehensiveJobPostingForm.js` and employer profile UI hide controls for unverified (implemented in UI)
- Status: Partial
- Gaps:
  - Need to confirm the same enforcement applies in all job creation/update endpoints (e.g., `app/api/jobs/[id]/route.js` update path). If not, add enforcement there.
  - Add server-side centralized policy utility for consistent enforcement.


11) Tests, Lint and CI
- Files / locations:
  - No dedicated tests found under `tests/` that exercise these flows (folder exists but no tests found in earlier search) — mostly missing.
- Status: Missing
- Gaps:
  - Unit tests for: shortlink generation, redirect, verification approval, posting limits, profile update flows, and upload prepare. Integration/E2E for uploads and admin flows.
  - CI should run `prisma migrate deploy` or lint and run tests before merging migrations.


12) Deployment & Migration Plan
- Files / locations:
  - `docs/db_migration_plan.md` — added in this session (new)
  - `prisma/schema.prisma` already edited to include `shortUrl` (file changed, migration not applied)
- Status: Partial
- Gaps:
  - Migrations (SQL) are not generated/applied. We must run `prisma migrate dev` to create migration files and commit them.
  - Add pre-release checklist for DB backup, staging migration, and post-deploy smoke tests.


---

## Concrete Missing Implementations (priority order)
1. Prisma migration & DB apply for `shortUrl` and any other additive schema changes (critical).
2. Employer dashboard UI: generate/regenerate short link, display short link, download QR. (UX to support new APIs.)
3. Server-side QR generation & storage endpoint (generate QR PNG from short link and store path to `job.qrImagePath`).
4. Add server-side policy utility to centralize enforcement of verification/employer-type rules and call it from all job create/update endpoints.
5. Add tests: unit tests for shortlink endpoint and redirect, integration tests for verification approve/reject, and E2E for upload flow.
6. Add migration/backfill scripts for new user/company/document fields if we apply them later.


---

## Quick next steps I can implement now (pick one or more):
- Produce a detailed file-level change plan and then apply additive Prisma edits and add backfill script. (Note: you selected "B" earlier; this doc is the gap matrix.)
- Implement server-side QR generation endpoint + persist PNG path and small front-end widget in employer profile to request QR generation.
- Add front-end employer dashboard controls to call the shortlink generation API and show the short link + download QR button.
- Add policies utility and wire enforcement into `app/api/jobs/[id]/route.js` and other job APIs.

---

If you want me to proceed, tell me which of the concrete next steps to run now (I will perform the code edits and run the appropriate validation steps). If you want the migration edits first, I will prepare an additive `prisma/schema.prisma` patch and a `scripts/backfill_verification_status.js` script and then stop (I won't run `prisma migrate` without your permission).
