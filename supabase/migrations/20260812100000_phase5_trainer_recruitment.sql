-- ELIVA SCHOOL Phase 5: private trainer recruitment metadata.
alter table public.trainers_crm
  add column if not exists source text not null default 'manual',
  add column if not exists applied_at timestamptz,
  add column if not exists birth_year integer,
  add column if not exists linkedin_url text,
  add column if not exists website_url text,
  add column if not exists training_mode_preferences text[] not null default '{}',
  add column if not exists available_wilayas text[] not null default '{}',
  add column if not exists languages text[] not null default '{}',
  add column if not exists education_level text,
  add column if not exists certifications_summary text,
  add column if not exists motivation text,
  add column if not exists public_application_id uuid unique,
  add column if not exists recruitment_consent boolean not null default false;

create index if not exists trainers_source_idx on public.trainers_crm(source);
create index if not exists trainers_applied_at_idx on public.trainers_crm(applied_at desc);

alter table public.trainers_crm enable row level security;
drop policy if exists "Admins manage trainers crm" on public.trainers_crm;
create policy "Admins manage trainers crm" on public.trainers_crm for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select, insert, update on public.trainers_crm to authenticated;
