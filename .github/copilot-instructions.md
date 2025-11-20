# AI Coding Agent Instructions for AI-Job-Board

## Project Overview
AI-Job-Board is a Next.js (App Router) application with a PostgreSQL database via Prisma. It provides a multi-role recruitment platform (super admin, employer admin, sub-users, job seekers) with job posting, ATS-like features, resume scanning, credit/subscription systems, analytics, and administrative tooling.

## Core Architecture
- Frontend: Next.js 15 App Router under `app/` using client components with Tailwind classes (no custom Tailwind config shown, but utility classes pervasive).
- API Layer: Route handlers under `app/api/**/route.js` use either `NextResponse` or `Response.json`. Standardize auth by always calling `getUserFromRequest(request)` from `utils/auth.js` for cookie-based JWT extraction (cookie `auth-token`). Avoid manual header parsing.
- Auth: JWT-based with helpers in `utils/auth.js`. Important exports: `generateToken`, `verifyToken`, `getUserFromRequest`. Use `ProtectedRoute` component + `AuthContext` for client-side gating.
- Role & Permission System: Defined in `utils/roleSystem.js` (USER_ROLES, PERMISSIONS, ACCESS_LEVELS, hasPermission, canManageUser, getDefaultPermissions). Prefer referencing constants instead of string literals.
- Database: Prisma schema in `prisma/schema.prisma` (large, normalized models). Key entities: `User`, `Job`, `Company`, `EmployerType`, `JobApplication`, credits/subscriptions, resume scanning relations (`ResumeScanResult`, `ResumeJobMatch`). Always regenerate client after schema changes (`npx prisma generate`).
- State/Context: `contexts/AuthContext.js` handles session discovery via `/api/auth/session`, provides `login`, `register`, `logout`, `getRedirectUrl`.
- UI Components: Under `components/` are feature-focused, usually single-file functional components (e.g. `JobListing.js`, `ResumeScanner_Real.js`, `ATSKanbanDashboard.js`). Keep props shallow; pattern favors composition over deep prop drilling.
- Super Admin Views: Pages under `app/super-admin/*` (e.g. `employer-types`, `settings`) use consistent patterns: header block (icon + gradient title), stat/cards grids, modals managed via local `useState`.

## Conventions & Patterns
- Authentication inside API routes: Immediately call `const user = getUserFromRequest(request);` then role-check (e.g. `if (!user || user.role !== 'super_admin') return ...`). Do NOT manually parse cookies or call `verifyToken` directly unless absolutely necessary.
- Error Responses: Use concise JSON `{ error: 'Message' }` with appropriate status codes (401 unauthorized, 403 forbidden, 404 not found, 500 server error). Keep logging server-side with contextual prefixes (see existing admin route logs).
- Role-based Filtering: Retrieve current user from Prisma then branch logic (example: in `admin/users/route.js` super admin sees all, employer admin sees only hierarchically related users). Follow existing conditional shape.
- Gradual Loading States: Dashboard-style pages use `loading` state plus skeleton/placeholder `'...'`; replicate that approach.
- Toggle Controls: Boolean settings implemented as custom switch using Tailwind and a translated circle; maintain same markup for visual consistency.
- Color Utility Mapping: Reusable color mapping function pattern (`getColorClasses(color)`) inside dashboards; extend locally rather than centralizing unless refactoring.

## Developer Workflows
- Install deps: `npm install` (postinstall triggers `prisma generate`).
- Development: `npm run dev` (uses Turbopack). Ensure `.env` contains `DATABASE_URL` and `JWT_SECRET`.
- Build: `npm run build` runs Prisma generate then Next build. EPERM errors on Windows may require closing other processes locking `node_modules/.prisma`.
- Prisma: After schema changes: `npx prisma generate`. Data seeding scripts in `database/seed-*.js` (run with `node database/seed-jobs.js` etc.).
- Lint: `npm run lint` (Next.js ESLint). Provide file globs carefully—passing file path can misbehave on Windows if quoting incorrectly.

## Extending API Routes
1. Create `app/api/<segment>/route.js` or nested folder. Export async HTTP verbs (`export async function GET(request) { ... }`).
2. Get user: `const user = getUserFromRequest(request);`.
3. Validate role with `USER_ROLES` constants; avoid magic strings.
4. Interact with Prisma: either instantiate `new PrismaClient()` locally or (preferred) import a shared instance from `utils/db` if present.
5. Return with `NextResponse.json(data, { status })`.

## Data Access & Safety
- Sanitize user input if needed using `sanitizeInput` from `utils/auth.js` (basic trimming & tag stripping).
- For password operations use `hashPassword` / `verifyPassword` from `utils/auth.js`—do not reinvent hashing.
- Avoid embedding business rules without checking corresponding enums in `schema.prisma` (e.g., job status, visibility).

## Adding New Super Admin Features
Follow existing page structure: protected route wrapper, header (icon + gradient), stats grid, action cards, modals (local state), consistent dark theme classes (`bg-gray-800`, `border-gray-700`).

## Examples
- Auth check pattern:
```js
const user = getUserFromRequest(request);
if (!user || user.role !== USER_ROLES.SUPER_ADMIN) {
  return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
}
```
- Permission check:
```js
if (!hasPermission(user, PERMISSIONS.SUPER_ADMIN.SYSTEM_SETTINGS)) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}
```

## What NOT To Do
- Do not parse Authorization headers for internal web requests; rely on cookie-based JWT.
- Do not duplicate role strings; always import from `utils/roleSystem.js`.
- Do not store plaintext secrets in code—use environment variables.
- Avoid heavy logic in components; push data shaping into API routes or utility functions.

## Priorities for Agents
1. Preserve consistent auth + role patterns.
2. Reuse existing UI interaction patterns (cards, toggles, modals).
3. Keep responses minimal and structured; avoid over-engineering.
4. Reference schema fields accurately—consult `prisma/schema.prisma` when unsure.

---
Feedback requested: Identify any missing workflows (tests, migrations strategy, logging standards) or unclear role/permission edge cases you want documented further.
