-- Meritify Academy LMS Phase 1. Additive and idempotent.
-- Run after the existing course, trainer and admission migrations.
-- No public policy is created for LMS tables or private LMS storage.

create table if not exists public.lms_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','trainer','student')),
  trainer_id uuid references public.trainers(id) on delete set null,
  display_name text,
  locale text not null default 'fr' check (locale in ('fr','ar')),
  status text not null default 'active' check (status in ('active','suspended')),
  access_start timestamptz,
  access_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lms_profiles_trainer_role_check check (role <> 'trainer' or trainer_id is not null)
);

create table if not exists public.lms_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.lms_profiles(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete set null,
  course_id uuid not null references public.courses(id) on delete cascade,
  session_id uuid references public.course_sessions(id) on delete set null,
  status text not null default 'active' check (status in ('active','suspended','completed')),
  access_start timestamptz not null default now(),
  access_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, course_id, session_id)
);

create table if not exists public.lms_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title_fr text not null,
  title_ar text not null,
  description_fr text,
  description_ar text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lms_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.lms_modules(id) on delete cascade,
  title_fr text not null,
  title_ar text not null,
  content_fr text,
  content_ar text,
  video_provider text check (video_provider is null or video_provider in ('mux','vimeo','youtube','external')),
  video_asset_id text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lms_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lms_lessons(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title_fr text not null,
  title_ar text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  constraint lms_resources_parent_check check (lesson_id is not null or course_id is not null)
);

create table if not exists public.lms_live_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  session_id uuid references public.course_sessions(id) on delete set null,
  title_fr text not null,
  title_ar text not null,
  provider text not null default 'google_meet',
  meeting_url text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lms_enrollments_student_idx on public.lms_enrollments(student_id, status);
create index if not exists lms_enrollments_course_idx on public.lms_enrollments(course_id, status);
create index if not exists lms_modules_course_order_idx on public.lms_modules(course_id, sort_order);
create index if not exists lms_lessons_module_order_idx on public.lms_lessons(module_id, sort_order);
create index if not exists lms_live_sessions_course_date_idx on public.lms_live_sessions(course_id, starts_at);

create or replace function public.lms_set_updated_at() returns trigger
language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists lms_profiles_updated_at on public.lms_profiles;
create trigger lms_profiles_updated_at before update on public.lms_profiles for each row execute function public.lms_set_updated_at();
drop trigger if exists lms_enrollments_updated_at on public.lms_enrollments;
create trigger lms_enrollments_updated_at before update on public.lms_enrollments for each row execute function public.lms_set_updated_at();
drop trigger if exists lms_modules_updated_at on public.lms_modules;
create trigger lms_modules_updated_at before update on public.lms_modules for each row execute function public.lms_set_updated_at();
drop trigger if exists lms_lessons_updated_at on public.lms_lessons;
create trigger lms_lessons_updated_at before update on public.lms_lessons for each row execute function public.lms_set_updated_at();
drop trigger if exists lms_live_sessions_updated_at on public.lms_live_sessions;
create trigger lms_live_sessions_updated_at before update on public.lms_live_sessions for each row execute function public.lms_set_updated_at();

create or replace function public.lms_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role') = 'admin', false)
    or lower(coalesce(auth.jwt()->>'email','')) = 'ilyesbelhay97@gmail.com';
$$;

create or replace function public.lms_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.lms_profiles where id = auth.uid() and status = 'active' limit 1;
$$;

create or replace function public.lms_can_access_course(p_course_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.lms_is_admin()
    or exists (select 1 from public.lms_enrollments e join public.lms_profiles p on p.id=e.student_id
      where e.student_id=auth.uid() and e.course_id=p_course_id and e.status='active' and p.status='active'
        and e.access_start <= now() and (e.access_end is null or e.access_end >= now()))
    or exists (select 1 from public.lms_profiles p join public.courses c on c.trainer_id=p.trainer_id
      where p.id=auth.uid() and p.role='trainer' and p.status='active' and c.id=p_course_id);
$$;

create or replace function public.lms_trainer_can_course(p_course_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lms_profiles p join public.courses c on c.trainer_id=p.trainer_id
    where p.id=auth.uid() and p.role='trainer' and p.status='active' and c.id=p_course_id);
$$;

alter table public.lms_profiles enable row level security;
alter table public.lms_enrollments enable row level security;
alter table public.lms_modules enable row level security;
alter table public.lms_lessons enable row level security;
alter table public.lms_resources enable row level security;
alter table public.lms_live_sessions enable row level security;

drop policy if exists lms_profiles_self_or_admin on public.lms_profiles;
create policy lms_profiles_self_or_admin on public.lms_profiles for select to authenticated using (id=auth.uid() or public.lms_is_admin());
drop policy if exists lms_profiles_admin_write on public.lms_profiles;
create policy lms_profiles_admin_write on public.lms_profiles for all to authenticated using (public.lms_is_admin()) with check (public.lms_is_admin());

drop policy if exists lms_enrollments_owner_staff on public.lms_enrollments;
create policy lms_enrollments_owner_staff on public.lms_enrollments for select to authenticated using (student_id=auth.uid() or public.lms_is_admin() or public.lms_can_access_course(course_id));
drop policy if exists lms_enrollments_admin_write on public.lms_enrollments;
create policy lms_enrollments_admin_write on public.lms_enrollments for all to authenticated using (public.lms_is_admin()) with check (public.lms_is_admin());

drop policy if exists lms_modules_access on public.lms_modules;
create policy lms_modules_access on public.lms_modules for select to authenticated using (public.lms_can_access_course(course_id) and (status='published' or public.lms_is_admin() or public.lms_role()='trainer'));
drop policy if exists lms_modules_staff_write on public.lms_modules;
create policy lms_modules_staff_write on public.lms_modules for all to authenticated using (public.lms_is_admin() or public.lms_trainer_can_course(course_id)) with check (public.lms_is_admin() or public.lms_trainer_can_course(course_id));

drop policy if exists lms_lessons_access on public.lms_lessons;
create policy lms_lessons_access on public.lms_lessons for select to authenticated using (exists (select 1 from public.lms_modules m where m.id=module_id and public.lms_can_access_course(m.course_id) and (lms_lessons.status='published' or public.lms_is_admin() or public.lms_role()='trainer')));
drop policy if exists lms_lessons_staff_write on public.lms_lessons;
create policy lms_lessons_staff_write on public.lms_lessons for all to authenticated using (public.lms_is_admin() or exists (select 1 from public.lms_modules m where m.id=module_id and public.lms_trainer_can_course(m.course_id))) with check (public.lms_is_admin() or exists (select 1 from public.lms_modules m where m.id=module_id and public.lms_trainer_can_course(m.course_id)));

drop policy if exists lms_resources_access on public.lms_resources;
create policy lms_resources_access on public.lms_resources for select to authenticated using (public.lms_is_admin() or (lesson_id is not null and exists (select 1 from public.lms_lessons l join public.lms_modules m on m.id=l.module_id where l.id=lesson_id and public.lms_can_access_course(m.course_id))) or (course_id is not null and public.lms_can_access_course(course_id)));
drop policy if exists lms_resources_staff_write on public.lms_resources;
create policy lms_resources_staff_write on public.lms_resources for all to authenticated using (public.lms_is_admin() or (course_id is not null and public.lms_trainer_can_course(course_id)) or (lesson_id is not null and exists (select 1 from public.lms_lessons l join public.lms_modules m on m.id=l.module_id where l.id=lesson_id and public.lms_trainer_can_course(m.course_id)))) with check (public.lms_is_admin() or (course_id is not null and public.lms_trainer_can_course(course_id)) or (lesson_id is not null and exists (select 1 from public.lms_lessons l join public.lms_modules m on m.id=l.module_id where l.id=lesson_id and public.lms_trainer_can_course(m.course_id))));

drop policy if exists lms_live_access on public.lms_live_sessions;
create policy lms_live_access on public.lms_live_sessions for select to authenticated using (public.lms_can_access_course(course_id));
drop policy if exists lms_live_staff_write on public.lms_live_sessions;
create policy lms_live_staff_write on public.lms_live_sessions for all to authenticated using (public.lms_is_admin() or public.lms_trainer_can_course(course_id)) with check (public.lms_is_admin() or public.lms_trainer_can_course(course_id));

grant select on public.lms_profiles, public.lms_enrollments, public.lms_modules, public.lms_lessons, public.lms_resources, public.lms_live_sessions to authenticated;
grant all on public.lms_profiles, public.lms_enrollments, public.lms_modules, public.lms_lessons, public.lms_resources, public.lms_live_sessions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit) values
  ('lms-files','lms-files',false,52428800),
  ('lms-videos','lms-videos',false,524288000)
on conflict (id) do update set public=false;

drop policy if exists lms_storage_admin on storage.objects;
create policy lms_storage_admin on storage.objects for all to authenticated using (bucket_id in ('lms-files','lms-videos') and public.lms_is_admin()) with check (bucket_id in ('lms-files','lms-videos') and public.lms_is_admin());
