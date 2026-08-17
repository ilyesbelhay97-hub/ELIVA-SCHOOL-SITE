# ELIVA SCHOOL — Architecture & Security Audit

Date: 2026-08-14

## Scope

This audit covers the current Next.js/Vercel repository, Supabase Auth, Data API, Storage, public French/Arabic website, admin CRM, admissions CRM, Courses CMS, Public Trainers CMS, recruitment, centers, registration and analytics code. It is an audit of the existing implementation, not a redesign.

## Architecture map

```text
Public routes: app/[locale]/* and app/* legacy aliases
  ├─ Server Components use lib/content.ts, lib/cms.ts, lib/i18n.ts
  ├─ Client presentation: components/marketing, components/course, components/i18n
  ├─ Public mutations: /api/registrations and /api/trainer-recruitment
  └─ Analytics: components/analytics -> lib/analytics

Admin routes: app/admin/(protected)/*
  ├─ app/admin/login + /api/admin/login -> Supabase Auth cookies
  ├─ app/admin/(protected)/layout.tsx -> lib/supabase/admin.ts authorization
  ├─ CRM client screens -> lib/supabase/client.ts publishable-key queries
  ├─ Admissions sensitive actions -> /api/admin/admissions -> service client
  ├─ Private CV -> /api/admin/trainers/[id]/cv -> short signed URL
  └─ Private payment receipts -> /api/admin/admissions/receipt/[paymentId]

Supabase boundary:
  ├─ lib/supabase/client.ts: browser publishable key only
  ├─ lib/supabase/server.ts: server session client, publishable key, RLS
  ├─ lib/supabase/service.ts: server-only service-role client
  ├─ supabase/migrations: schema, RLS, Storage buckets and RPCs
  └─ public Storage: course-covers/trainer-public; private Storage: trainer-cv/payment-receipts
```

### Domain inventory

| Domain | Current implementation | Boundary assessment |
|---|---|---|
| Authentication | `app/api/admin/login`, `lib/supabase/server.ts`, `proxy.ts` | Session cookie plus server authorization |
| Admissions | `components/admin/admissions-crm.tsx`, `lib/admissions.ts`, `/api/admin/admissions` | Sensitive mutations server-side; one `registrations` row per client |
| Payments/Finance | `finance_payments` canonical ledger, Phase 9 compatibility view, private proofs | Verification, totals and corrections are server-side |
| Courses | `lib/courses.ts`, `lib/cms.ts`, `components/admin/courses-cms.tsx` | CMS mutations currently direct from an authenticated client |
| Public trainers | `public_trainers_cms` view and public pages | Public projection hardened in this audit |
| Internal trainers CRM | `components/admin/trainers-crm.tsx`, `trainers_crm` | RLS protected; some mutations direct from client |
| Recruitment | `/api/trainer-recruitment`, private `trainer-cv` | Server validation and orphan cleanup present |
| Centers | `components/admin/centers-crm.tsx`, `centers` | RLS protected; direct authenticated client mutations |
| Public website | `app/[locale]`, `app/*`, marketing/course components | FR/AR and RTL separated from admin |
| i18n | `lib/i18n.ts`, locale route group, `proxy.ts` | `/fr` and `/ar`; admin excluded from locale routing |
| Uploads | Storage client for CMS, server upload for CV/payment | CMS upload validation is partly client-only |
| Analytics | `lib/analytics`, `components/analytics` | Public event tracking; no private CRM payload observed |

## Frontend/backend boundary

### Safe direct client access

- Public read-only content through RLS-filtered public courses/trainers views.
- Admin CRUD through the browser publishable key is only acceptable while RLS policies independently enforce `eliva_is_admin()`. It is not a substitute for server authorization.

### Should move server-side

- Courses CMS and Public Trainers CMS create/update/publish operations.
- Centers and legacy registrations CRM mutations.
- Course-cover and public-trainer image uploads, with server-side MIME, size and path validation.

### Already server-side / critical operations

- Admin admissions stage transitions, contact attempts, dossier updates and student confirmation.
- Payment receipt upload, verification, rejection, correction and signed URL generation.
- Trainer recruitment CV upload and CRM insert.
- Admin CV signed URL generation.
- Course and public-trainer publish/unpublish actions now pass through `/api/admin/cms`; database triggers reject publication-state changes originating from anon/authenticated direct clients.

No client component imports `SUPABASE_SERVICE_ROLE_KEY` or `lib/supabase/service.ts`.

## Supabase client model

| File | Key | Intended use |
|---|---|---|
| `lib/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser client; publishable only |
| `lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Server session/RLS client |
| `lib/supabase/service.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged operations |

The service key appears only in server-side modules and the diagnostic script. It is not named `NEXT_PUBLIC_*`, not logged, and is ignored by Git through `.env*` rules.

## Authentication and authorization

- Supabase Auth creates the session cookie through `/api/admin/login`.
- `app/admin/(protected)/layout.tsx` protects admin pages.
- `lib/supabase/admin.ts` now centralizes authorization using `app_metadata.role === admin`, the approved admin email, and `ADMIN_EMAILS`.
- Admissions and receipt APIs call `requireAdmin()` server-side.
- CV access now uses the same centralized authorization rule, including the approved email allowlist.
- `proxy.ts` refreshes Supabase cookies for `/admin` and excludes `/api`, preventing locale middleware from creating an alternate admin path.

Remaining authentication hardening: verify expired-session behavior in a controlled browser test; login rate limiting is now durable and fail-closed.

## Storage model

- `trainer-cv`: private, PDF-only, 5 MB bucket limit; only admin route returns a 300-second signed URL.
- `payment-receipts`: private, JPEG/PNG/WebP, 5 MB; only admin route returns a 60-second signed URL.
- `course-covers` and `trainer-public`: public-read media with admin-only RLS writes.
- Upload paths use generated UUIDs rather than trusting the original filename.
- Recruitment and payment flows remove the uploaded file if the database insert fails.

## Findings

| ID | Severity | File/area | Finding and risk | Fix/status | Launch blocking |
|---|---|---|---|---|---|
| SEC-01 | CRITICAL | Vercel environment | The service client cannot operate without `SUPABASE_SERVICE_ROLE_KEY`; a missing or wrong Vercel value breaks recruitment, admissions and private file operations. | Configure the server-only variable in Vercel Production and Preview; never expose it. | Yes until configured |
| SEC-02 | HIGH | `app/api/trainer-recruitment/route.ts`, `/api/registrations`, `/api/admin/login` | Public and authentication abuse controls were previously not durable on Vercel. | Added durable Supabase-backed limiter with HTTP 429 responses and fail-closed 503 configuration errors. | Fixed in code; verify production environment |
| SEC-03 | HIGH | `components/admin/courses-cms.tsx`, `public-trainers-cms.tsx`, `centers-crm.tsx`, `registrations-crm.tsx` | Some harmless admin CRUD and CMS content edits remain direct browser mutations. | Publication-state changes moved to `/api/admin/cms`; general CRUD and uploads remain a follow-up server-route migration. | No immediate blocker for current admin |
| SEC-04 | HIGH | `supabase` grants/policies | The project contained broad historical Data API grants and duplicate policies. RLS limited row access, but unnecessary anon privileges increased GraphQL/API exposure. | Applied targeted revokes, anon registration INSERT-only, and column-scoped public trainer access. Re-audit unrelated legacy tables separately. | No for ELIVA tables after verification |
| SEC-05 | HIGH | public trainer view | `public.public_trainers_cms` was live as a Security Definer view. Although its projection excluded current private fields, future view edits could bypass RLS. | Applied `security_invoker`, public row policy and column-scoped anon grants; removed the advisor finding. | Fixed |
| SEC-06 | HIGH | Admin POST routes | No explicit Origin/Referer validation was implemented for cookie-authenticated mutation routes. | Added shared Origin/Host validation to admin login, admissions and CMS mutation routes. | Fixed in code; verify production proxy headers |
| SEC-07 | MEDIUM | `courses` policies | Legacy `status='published'` and CMS `publish_status='published'` policies coexist. Different consumers could see different publication states. | Standardize public reads on `publish_status` and retire legacy policy after data migration review. | Possible content exposure |
| SEC-08 | MEDIUM | `next.config.ts` | Security headers were absent. | Added nosniff, strict referrer policy, same-origin framing and permissions policy. CSP/HSTS require a production-domain verification before adding. | Fixed |
| SEC-09 | MEDIUM | `dangerouslySetInnerHTML` | JSON-LD is emitted with `JSON.stringify`; no user HTML rendering was found. | No fix required; keep CMS fields as text/JSON and do not add unsanitized HTML. | No |
| SEC-10 | LOW | `set_updated_at()` | Supabase advisor reported mutable function search path. | Applied `search_path = public` locally and remotely. | Fixed |

## Payment integrity assessment

- Uploaded receipts are `pending` and do not contribute to the payment summary.
- Only `verified` payments count toward `total_verified_paid`.
- `verified_by` is taken from the authenticated server-side Supabase user, not the request body.
- Verified payments cannot be silently edited; correction uses `voided`, a reason, timestamps, user and an admission event.
- Final confirmation checks dossier completion for Presentiel and verified amount for Online.
- The receipt path is stored, not a permanent public URL.

## Data integrity assessment

- Admission attempts have unique `(registration_id, attempt_type, attempt_date)` and attempt-number constraints.
- RPCs enforce maximum three attempts and separate initial-contact/dossier-follow-up counters.
- Payment amounts are constrained positive and payment status is constrained.
- Foreign keys cascade admission child records with their registration; this preserves one logical client record while removing its dependent history if an admin explicitly deletes the parent. Prefer archive over delete operationally.
- Prospect duplicate protection is currently application-level phone checking; add a normalized-phone unique key or deterministic duplicate policy before high-volume use.

## Scores

| Area | Score | Reason |
|---|---:|---|
| Overall architecture | 7/10 | Clear modular-monolith boundaries, but several older and newer CRM paths coexist. |
| Module separation | 6/10 | Domains are recognizable; admin components still contain data access and UI together. |
| Maintainability | 6/10 | Central Supabase factories exist, but some components are overly dense and duplicate validation. |
| Frontend/backend boundary | 6/10 | Admissions/payments/recruitment are server-protected; legacy CMS/CRM writes remain browser-driven. |
| Authentication | 7/10 | Supabase SSR cookie flow and protected layout are present; rate limiting/session tests remain. |
| Authorization | 7/10 | Server checks and RLS exist; CV authorization is now consistent. |
| Database/RLS security | 6/10 | ELIVA tables are protected and anon grants hardened; unrelated legacy project objects still create advisor noise. |
| File/storage security | 8/10 | Private CV/receipt buckets, limits, validation and signed URLs are implemented. |
| Payment integrity | 8/10 | Server verification, immutable correction state and audit events are present. |
| Production readiness | 6/10 | Build is healthy, but rate limiting, Vercel secrets and controlled Supabase tests remain. |

## Automatic fixes applied

- Centralized admin authorization and reused it for secure CV access.
- Marked service-role and rate-limit modules with `server-only`; no client component imports the service key.
- Hardened public trainer projection with `security_invoker` and column-level grants.
- Revoked anonymous access to private ELIVA CRM/admission tables and restricted registrations to INSERT for anon.
- Added production-safe baseline security headers.
- Marked admin admissions and private receipt responses `private, no-store`.
- Hardened `set_updated_at()` search path.
- Applied the Supabase hardening SQL to the configured project and verified the targeted changes.
- Added `npm run verify:security`; the configured project currently denies anonymous CRM/private-storage reads and allows only published public reads.

## Manual fixes required

- Set and verify all Vercel Production/Preview environment variables.
- Verify the durable limiter table/RPC and HTTP 429 behavior in Vercel Production.
- Complete controlled anonymous/admin RLS tests using a staging or maintenance window.
- Decide whether to migrate legacy direct-client admin CRUD to server routes before inviting additional admins.
- Review unrelated legacy Supabase tables/functions shown by the advisor; they are outside the ELIVA module but affect the project-wide advisor score.

## Verdict

## Final-pass result

The code-side Priority 1–6 fixes are now implemented. The anonymous verification script passes against the configured project. The remaining launch decision depends on Vercel environment configuration and controlled admin/429/expired-session tests documented in `SECURITY_GO_LIVE_CHECKLIST.md`.

`SECURITY READY FOR PRODUCTION: NO`

The ELIVA-specific private data and payment controls are materially hardened, but public launch remains blocked until Vercel has the server secret and the live anonymous/admin/storage checks pass.
