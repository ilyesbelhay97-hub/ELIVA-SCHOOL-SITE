# ELIVA SCHOOL — Supabase go-live checklist

## SQL

- [ ] Open the correct Supabase project dashboard.
- [ ] Open **SQL Editor**.
- [ ] Run `supabase/FINAL_SUPABASE_SETUP.sql` completely.
- [ ] Confirm the query finishes without errors.
- [ ] Refresh the Supabase API schema cache if the dashboard requests it.

## Tables and security

- [ ] Confirm `courses`, `registrations`, `trainers_crm`, `trainer_interactions`, `centers`, and `center_interactions` exist.
- [ ] Confirm RLS is enabled on all six tables.
- [ ] Confirm anonymous users can insert only consented registrations with status `new`.
- [ ] Confirm anonymous users cannot select registrations, CRM trainers, centers, interactions, or notes.
- [ ] Confirm `public_trainers_cms` returns only `is_public = true` and only public columns.
- [ ] Confirm the admin email is `ilyesbelhay97@gmail.com` or has `app_metadata.role = admin`.

## Storage

- [ ] Confirm bucket `trainer-cv` exists and is **private**.
- [ ] Confirm `trainer-cv` accepts only `application/pdf` and has a 5 MB limit.
- [ ] Confirm buckets `course-covers` and `trainer-public` are public for reading.
- [ ] Confirm uploads, updates, and deletes require the ELIVA admin policy.
- [ ] Confirm CV access is only through `/api/admin/trainers/[id]/cv` and signed URLs.
- [ ] Confirm private bucket `payment-receipts` exists, accepts JPEG/PNG/WebP only, and is limited to 5 MB.
- [ ] Confirm payment receipts are opened only through the short-lived signed URL route.

## Phase 9 admissions

- [ ] Run `supabase/migrations/20260814100000_phase9_admissions.sql` in the target project if it is not already applied.
- [ ] Confirm `admission_attempts`, `admission_events`, `admission_documents`, and `admission_payments` exist with RLS enabled.
- [ ] Confirm the same `registrations.id` is used across prospect, pre-registration, and student stages.
- [ ] Verify the initial-contact limit is 3 and one attempt per calendar day.
- [ ] Verify dossier follow-ups have an independent limit of 3 and one per calendar day.
- [ ] For a controlled online test, upload a receipt, verify it, and confirm only verified amounts count in `admission_payment_summary`.
- [ ] Verify rejected receipts do not count and verified financial rows are not hard-deleted.
- [ ] Verify presentiel final confirmation requires a complete dossier.
- [ ] Verify online final confirmation requires full verified payment when a total is agreed.

## Authentication

- [ ] In **Supabase Dashboard → Authentication → Users**, create or confirm the user `ilyesbelhay97@gmail.com`.
- [ ] Set/reset its password using the Supabase Dashboard; do not put the password in Git or Vercel source.
- [ ] If using roles, open the user metadata and set `app_metadata` to `{ "role": "admin" }`.
- [ ] Sign in at `/admin/login` and confirm redirect to `/admin`.
- [ ] Sign out and confirm `/admin` redirects back to `/admin/login`.

## Vercel environment variables

- [ ] Add all variables from `.env.example` to the Vercel project for Production, Preview, and Development as appropriate.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS domain in Production.
- [ ] Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.
- [ ] Redeploy only after variables are saved.

## Acceptance tests

- [ ] Create a draft course with FR and AR content.
- [ ] Upload a course cover, associate a trainer, preview, publish, and verify `/fr` and `/ar`.
- [ ] Unpublish the course and verify it disappears from public queries.
- [ ] Publish a trainer with public FR/AR fields and photo; verify the public profile.
- [ ] Unpublish the trainer and verify it disappears publicly.
- [ ] Submit a controlled registration and verify one `new` row in `registrations`.
- [ ] Submit a controlled PDF recruitment application and verify one `website_recruitment` row and private CV.
- [ ] Create, edit, filter, interact with, and archive a center from `/admin/centres`.
- [ ] Verify Arabic pages have `dir="rtl"` and French pages have `dir="ltr"`.
- [ ] Delete controlled test rows/files after review if they are not needed.
