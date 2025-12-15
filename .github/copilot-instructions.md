# AI Coding Agent Instructions for AI-Job-Board

## Snapshot
- Next.js 15 App Router + React 19 in `app/`; Prisma/PostgreSQL in `prisma/schema.prisma`.
- Domains: job creation/ATS, resume parsing, billing, super-admin, importer/aggregator, QR/share links.

## Architecture & Patterns
- API handlers live in `app/api/**/route.js`; return `NextResponse`. Keep business logic in utilities (`utils/db.js`, `utils/policy.js`, `utils/jobImportManager.js`).
- Auth: `utils/auth.js` (`getUserFromRequest` is async; always `await`). Roles/constants from `utils/roleSystem.js`. Account lock check in `isAccountLocked`.
- Data: use the shared `prisma` or `db` from `utils/db.js`—do not `new PrismaClient`. `db.jobs.*` adds company wiring and verified-doc metadata.
- Policy: `utils/policy.js` enforces posting limits/placement-fee restrictions (`canCreateJob`, `canGenerateShortlink`, `isVerified`).
- State/UX: contexts in `contexts/*.js` (`AuthContext`, `NotificationContext`, `SubscriptionContext`) + `ProtectedRoute` gate client flows.

## Job Creation Engine
- Forms: `components/ComprehensiveJobPostingForm.js` (functional role, specialization, course, region, deal breakers, passport, principal/department label, DMW mandatory statement, placement fee, sea/land fields), `components/JobPostingForm.js` (simpler RHF/yup), `components/JobManagement.js` (manage/edit/duplicate).
- Backends: `app/api/jobs/comprehensive-post/route.js` (maps comprehensive form, clamps end date: premium 60d vs free 30d, deadline <= end date, DMW compliance checks), `app/api/jobs/route.js` (basic create/list with `db.jobs`), `app/api/jobs/manage/route.js` (employer job list), shortlink/QR in `app/api/jobs/[id]/share` + `app/api/jobs/[id]/qr` (requires `canGenerateShortlink` and `NEXT_PUBLIC_SITE_URL`).
- Rich text: `components/RichTextEditor.js` wraps TipTap with spacing/markdown/normalization—preserve normalization hooks and classes.

## Importer / Aggregator
- Scraping pipeline: `utils/jobAggregator.js` + `utils/jobImportManager.js`; dedupe via hash in `persistImportedJobs`. Review UI at `app/super-admin/imports/page.js`.
- Endpoints: `app/api/jobs/imports/**`, `app/api/jobs/aggregate/run` restricted to `super_admin`/`employer_admin`.
- RSS build: `scripts/run-aggregator.js` reads `scripts/aggregator-urls.json` or `AGGREGATOR_URLS`, writes `public/feeds/aggregated.xml`.

## Compliance & Employer Types
- Models: `EmployerType` and `EmployerTypeRequirement` in `prisma/schema.prisma`; seeds in `database/seed-employer-types.js` and `database/seed-employer-type-requirements.js`.
- Validation helpers: `utils/validators.js` (TIN/BIR/DOLE/DMW patterns) and `app/api/verification/*` endpoints (always await auth). Posting policies depend on verified documents + employer subtype (DMW/overseas must set mandatory statements and vessel/land fields).

## Developer Workflows
- Install: `npm install` (postinstall runs `prisma generate`). Dev: `npm run dev` (Turbopack). Build: `npm run build` (runs `prisma generate` first). Lint: `npm run lint` (needs `typescript` present).
- Migrations: `npx prisma migrate dev --schema=prisma/schema.prisma`. After schema edits, run `npx prisma generate` if not using scripts.
- Seeds: `node database/seed-*.js` (jobs, employer types, employer type requirements, ATS, etc.).
- Aggregator: `npm run aggregator:run` or `node scripts/run-aggregator.js` with `AGGREGATOR_URLS`/`scripts/aggregator-urls.json` configured.

## API Conventions
- Start handlers with auth + role guard; return `{ error }` with status codes. Use `sanitizeInput` for user text. Reuse enums in `prisma/schema.prisma` (job status, work mode, etc.).
- For scraped/imported jobs, publish via `approveImport`/`db.jobs.create` to keep company linking and verification flags intact.

## UI/Styling Notes
- Tailwind utility style with gradient headers, stat cards, skeletons in dashboards/super-admin.
- Mobile apply bars rely on `compactCTA` scroll behavior—preserve when touching CTA sections.

## Avoid
- Don’t instantiate Prisma clients or parse JWT cookies manually—use `getUserFromRequest` + shared `prisma`/`db`.
- Don’t bypass `db.jobs`/policy helpers for job creation; placement fee and posting limits are enforced there.

Feedback welcome: if a workflow or permission edge case is unclear, ask to document it.
