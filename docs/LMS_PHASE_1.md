# Meritify Academy — LMS Phase 1

## Scope

Phase 1 adds authenticated student and trainer spaces on top of the existing courses, trainers, registrations, admissions and finance systems. It does not replace the public website or create a second admin area.

Implemented routes:

- `/{locale}/login` — Supabase Auth login and password reset.
- `/{locale}/student` — active enrollments and upcoming live sessions.
- `/{locale}/student/courses/{courseId}` — protected modules, lessons, resources and live sessions.
- `/{locale}/trainer` — only courses assigned to the authenticated trainer.
- `/{locale}/trainer/courses/{courseId}` — protected trainer course view.
- `/admin/lms` — existing admin shell extension for LMS access activation.

## Database migration

Run `supabase/migrations/20260929090000_lms_phase1.sql` after the existing migrations. It is additive and uses `if not exists`, but the live project must be checked before execution. It creates `lms_profiles`, `lms_enrollments`, `lms_modules`, `lms_lessons`, `lms_resources` and `lms_live_sessions`, plus the private `lms-files` and `lms-videos` buckets.

The migration intentionally does not grant anonymous access to LMS tables or storage. Students and trainers are restricted by active profile/enrollment/assignment, while admins are identified by the existing admin policy.

## Required Supabase actions

1. Confirm the current schema does not already contain these LMS tables.
2. Execute the migration in Supabase SQL Editor.
3. Confirm both LMS buckets are private.
4. Add the server-only `SUPABASE_SERVICE_ROLE_KEY` to local/Vercel server environment variables. Never add it with a `NEXT_PUBLIC_` prefix.
5. Configure an email provider or Supabase invite settings if accounts should receive invitations.
6. Create/confirm the admin Auth user and keep `ADMIN_EMAILS` configured.

The admin activation endpoint creates or resolves an Auth user through the server-only service client and creates the corresponding LMS profile. Student activation requires a CRM `registration_id`, a matching course, and at least one non-voided `finance_payments.status = 'verified'` record. Students then receive an enrollment linked to the selected course. A trainer profile is linked to the existing public trainer record.

## Security notes

Private resource signed URLs are created for five minutes by a server route after the authenticated user is checked by RLS. Meeting URLs are rendered only on authenticated course pages. No service-role client is imported by a Client Component.

## Phase 1.1 MVP additions

The admin LMS now has a course manager at `/admin/lms/formations` with module, lesson and live-session create/publish/unpublish/delete operations. The server-only resource upload endpoint validates file type/size, stores files in private `lms-files`, writes metadata and removes an orphaned upload when metadata insertion fails. The student course page includes an RTL-aware curriculum, lesson player, resources and upcoming live sessions.

Student progress is deliberately not displayed or persisted. Trainer authoring remains deferred to Phase 1.2; trainers can still only see assigned courses under the existing RLS model.

## Not in Phase 1

Quizzes, assignments, certificates, progress analytics, gamification, community, native mobile apps, attendance and subscription billing are intentionally deferred.

## Verification status

The repository implementation can be linted, typechecked and built locally. Live Supabase schema/RLS/storage verification remains required because the local service-role key is not available and the configured public key returned `401` during the pre-change read-only inspection.
