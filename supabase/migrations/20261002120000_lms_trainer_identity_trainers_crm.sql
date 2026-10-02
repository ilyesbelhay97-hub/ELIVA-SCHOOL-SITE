-- Meritify LMS: use the operational trainers_crm directory as the single trainer identity.
-- Safe because this migration aborts if any existing non-null trainer_id would be orphaned.

do $$
declare
  orphaned_courses integer;
  orphaned_profiles integer;
begin
  select count(*) into orphaned_courses
  from public.courses c
  left join public.trainers_crm t on t.id = c.trainer_id
  where c.trainer_id is not null and t.id is null;

  select count(*) into orphaned_profiles
  from public.lms_profiles lp
  left join public.trainers_crm t on t.id = lp.trainer_id
  where lp.trainer_id is not null and t.id is null;

  if orphaned_courses > 0 or orphaned_profiles > 0 then
    raise exception 'trainer identity migration aborted: % orphaned course links, % orphaned LMS profile links', orphaned_courses, orphaned_profiles;
  end if;
end $$;

alter table public.lms_profiles drop constraint if exists lms_profiles_trainer_id_fkey;
alter table public.courses drop constraint if exists courses_trainer_id_fkey;

alter table public.lms_profiles
  add constraint lms_profiles_trainer_id_fkey
  foreign key (trainer_id) references public.trainers_crm(id) on delete set null;

alter table public.courses
  add constraint courses_trainer_id_fkey
  foreign key (trainer_id) references public.trainers_crm(id) on delete set null;

create or replace function public.lms_is_trainer_for_course(_course_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.lms_profiles lp
    join public.courses c on c.trainer_id = lp.trainer_id
    where lp.user_id = auth.uid()
      and lp.user_type = 'trainer'
      and lp.active = true
      and c.id = _course_id
  );
$$;
