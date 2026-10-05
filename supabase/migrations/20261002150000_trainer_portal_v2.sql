-- Meritify Academy Trainer Portal V2 (additive only).
-- Run after the existing LMS and trainer identity migrations.
-- This migration never duplicates trainer identities or changes production content.

create table if not exists public.trainer_profile_change_requests (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers_crm(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  proposed_changes jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_reviews (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers_crm(id) on delete cascade,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrollment_id uuid references public.lms_enrollments(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_user_id, course_id)
);

create index if not exists trainer_profile_change_requests_trainer_idx
  on public.trainer_profile_change_requests(trainer_id, status, created_at desc);
create index if not exists trainer_reviews_trainer_status_idx
  on public.trainer_reviews(trainer_id, status, created_at desc);

create or replace function public.trainer_portal_is_owner(p_trainer_id uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.lms_profiles p
    where p.user_id = auth.uid() and p.user_type = 'trainer' and p.active = true
      and p.trainer_id = p_trainer_id
  );
$$;

alter table public.trainer_profile_change_requests enable row level security;
alter table public.trainer_reviews enable row level security;

drop policy if exists trainer_profile_requests_owner_read on public.trainer_profile_change_requests;
create policy trainer_profile_requests_owner_read on public.trainer_profile_change_requests
  for select to authenticated using (public.trainer_portal_is_owner(trainer_id) or public.lms_is_admin());
drop policy if exists trainer_profile_requests_owner_insert on public.trainer_profile_change_requests;
create policy trainer_profile_requests_owner_insert on public.trainer_profile_change_requests
  for insert to authenticated with check (public.trainer_portal_is_owner(trainer_id) and requested_by = auth.uid());
drop policy if exists trainer_profile_requests_admin_update on public.trainer_profile_change_requests;
create policy trainer_profile_requests_admin_update on public.trainer_profile_change_requests
  for update to authenticated using (public.lms_is_admin()) with check (public.lms_is_admin());

drop policy if exists trainer_reviews_public_read on public.trainer_reviews;
create policy trainer_reviews_public_read on public.trainer_reviews
  for select to anon, authenticated using (status = 'approved');
drop policy if exists trainer_reviews_owner_read on public.trainer_reviews;
create policy trainer_reviews_owner_read on public.trainer_reviews
  for select to authenticated using (student_user_id = auth.uid() or public.lms_is_admin());
drop policy if exists trainer_reviews_student_insert on public.trainer_reviews;
create policy trainer_reviews_student_insert on public.trainer_reviews
  for insert to authenticated with check (
    student_user_id = auth.uid()
    and exists (
      select 1 from public.lms_enrollments e
      join public.courses c on c.id = e.course_id
      where e.id = public.trainer_reviews.enrollment_id and e.user_id = auth.uid() and e.course_id = public.trainer_reviews.course_id
        and e.status in ('active','completed') and c.trainer_id = public.trainer_reviews.trainer_id
    )
  );
drop policy if exists trainer_reviews_admin_update on public.trainer_reviews;
create policy trainer_reviews_admin_update on public.trainer_reviews
  for update to authenticated using (public.lms_is_admin()) with check (public.lms_is_admin());

grant select, insert on public.trainer_profile_change_requests to authenticated;
grant select, insert on public.trainer_reviews to authenticated;
grant update on public.trainer_reviews, public.trainer_profile_change_requests to authenticated;
