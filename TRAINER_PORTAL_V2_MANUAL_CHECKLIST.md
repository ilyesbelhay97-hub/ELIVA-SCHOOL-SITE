# Meritify Trainer Portal V2 — manual release checklist

## Supabase

- [ ] In Supabase SQL Editor, review and run `supabase/migrations/20261002150000_trainer_portal_v2.sql`.
- [ ] Confirm `lms_profiles.trainer_id` and `courses.trainer_id` reference `trainers_crm.id`.
- [ ] Confirm `lms-files` and `lms-videos` are private.
- [ ] Confirm trainer policies deny access when the course is assigned to another trainer.
- [ ] Confirm the migration creates `trainer_profile_change_requests` and `trainer_reviews`.

## Trainer A / Trainer B authorization

- [ ] Trainer A can read and mutate only the assigned course, modules, lessons, resources, and live sessions.
- [ ] Trainer A receives a denial for Trainer B’s course, module, lesson, resource, and live session IDs.
- [ ] Upload a small MP4 to `lms-videos`; verify only a short-lived signed URL is returned.
- [ ] Upload a PDF/DOC resource to `lms-files`; verify it is stored under the trainer/course path and remains private.

## Profile and approval

- [ ] Trainer submits `/fr/trainer/profile` and `/ar/trainer/profile` changes.
- [ ] Admin reviews `/admin/formateurs/demandes` and approves/rejects the request.
- [ ] Confirm only approved public fields are displayed publicly.

## Student regression

- [ ] A paid/active student can play published content and access published resources.
- [ ] An unauthorized student cannot access another course’s private content.
- [ ] Arabic RTL, French LTR, mobile drawer, uploads, reorder, and logout work on a real mobile viewport.

## Ratings

- [ ] Insert one review only for a valid active/completed enrollment.
- [ ] Verify rating values outside 1–5, self-rating, duplicate course reviews, and unauthorized users are denied.
- [ ] Admin moderates reviews; public output contains approved reviews only.
