-- ELIVA SCHOOL Phase 4: registrations, admin CRM, and RLS.
-- Apply after the existing public schema migrations.

do $$ begin
  create type public.trainer_status as enum ('not_contacted','contacted','meeting_scheduled','work_session_done','validated','to_review','rejected','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.center_status as enum ('not_contacted','contacted','visited','tested','favorite','rejected','archived');
exception when duplicate_object then null; end $$;

alter table public.registrations add column if not exists course_name_snapshot text;
alter table public.registrations add column if not exists study_mode text;
alter table public.registrations add column if not exists consent boolean not null default false;
alter table public.registrations add column if not exists source_page text;
alter table public.registrations add column if not exists internal_notes text;

update public.registrations set study_mode = case when preferred_contact_method = 'email' then 'online' else 'presentiel' end where study_mode is null;
alter table public.registrations alter column study_mode set default 'presentiel';
alter table public.registrations alter column study_mode set not null;
alter table public.registrations drop constraint if exists registrations_study_mode_check;
alter table public.registrations add constraint registrations_study_mode_check check (study_mode in ('presentiel','online'));

create table if not exists public.trainers_crm (
  id uuid primary key default gen_random_uuid(), full_name text not null, phone text, email text, wilaya text, city text, specialty text,
  skills text[] not null default '{}', courses_can_teach text[] not null default '{}', years_experience numeric(5,1), cv_url text, portfolio_url text, photo_url text,
  status public.trainer_status not null default 'not_contacted', last_contact_at timestamptz, next_action_at timestamptz, next_action text,
  pedagogical_quality smallint check (pedagogical_quality between 1 and 5), field_experience smallint check (field_experience between 1 and 5), communication smallint check (communication between 1 and 5), availability_rating smallint check (availability_rating between 1 and 5), tariff_rating smallint check (tariff_rating between 1 and 5), expected_fee numeric(12,2), fee_unit text, internal_notes text, is_favorite boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.trainer_interactions (
  id uuid primary key default gen_random_uuid(), trainer_id uuid not null references public.trainers_crm(id) on delete cascade, type text not null, title text, notes text, interaction_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create table if not exists public.centers (
  id uuid primary key default gen_random_uuid(), center_name text not null, wilaya text not null, city text, address text, contact_person text, phone text, whatsapp text, email text,
  capacity integer, hourly_rate numeric(12,2), daily_rate numeric(12,2), deposit_amount numeric(12,2), currency text not null default 'DZD', has_projector boolean not null default false, has_wifi boolean not null default false, has_air_conditioning boolean not null default false, has_heating boolean not null default false, has_parking boolean not null default false, has_break_area boolean not null default false, has_sound_system boolean not null default false, has_whiteboard boolean not null default false, google_maps_url text, photos text[] not null default '{}', rental_conditions text, status public.center_status not null default 'not_contacted', already_worked_with boolean not null default false, last_rental_at timestamptz, experience_rating smallint check (experience_rating between 1 and 5), is_favorite boolean not null default false, internal_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.center_interactions (
  id uuid primary key default gen_random_uuid(), center_id uuid not null references public.centers(id) on delete cascade, type text not null, title text, notes text, amount numeric(12,2), interaction_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create index if not exists registrations_course_name_idx on public.registrations(course_name_snapshot);
create index if not exists registrations_wilaya_idx on public.registrations(wilaya);
create index if not exists trainers_crm_status_idx on public.trainers_crm(status);
create index if not exists centers_wilaya_idx on public.centers(wilaya);

drop trigger if exists trainers_crm_set_updated_at on public.trainers_crm;
create trigger trainers_crm_set_updated_at before update on public.trainers_crm for each row execute function public.set_updated_at();
drop trigger if exists centers_set_updated_at on public.centers;
create trigger centers_set_updated_at before update on public.centers for each row execute function public.set_updated_at();

alter table public.trainers_crm enable row level security;
alter table public.trainer_interactions enable row level security;
alter table public.centers enable row level security;
alter table public.center_interactions enable row level security;

drop policy if exists "Public can submit registrations" on public.registrations;
drop policy if exists "Public can submit registrations with consent" on public.registrations;
create policy "Public can submit registrations with consent" on public.registrations for insert to anon, authenticated with check (status = 'new' and consent = true);

drop policy if exists "Admins manage registrations" on public.registrations;
create policy "Admins manage registrations" on public.registrations for all to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins manage trainers crm" on public.trainers_crm;
create policy "Admins manage trainers crm" on public.trainers_crm for all to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins manage trainer interactions" on public.trainer_interactions;
create policy "Admins manage trainer interactions" on public.trainer_interactions for all to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins manage centers" on public.centers;
create policy "Admins manage centers" on public.centers for all to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins manage center interactions" on public.center_interactions;
create policy "Admins manage center interactions" on public.center_interactions for all to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select, insert, update on public.registrations to authenticated;
grant select, insert, update on public.trainers_crm, public.trainer_interactions, public.centers, public.center_interactions to authenticated;
grant insert on public.registrations to anon;
