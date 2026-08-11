create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  title text,
  bio text,
  photo_url text,
  credentials jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  trainer_id uuid references public.trainers(id) on delete set null,
  cover_url text,
  format text not null default 'presentiel' check (format in ('presentiel', 'en_ligne', 'hybride')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  city text not null,
  venue text,
  start_date timestamptz not null,
  end_date timestamptz,
  duration_label text not null,
  price numeric(12, 2),
  capacity integer check (capacity is null or capacity > 0),
  registration_open boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  phone text not null check (char_length(trim(phone)) between 6 and 40),
  email text,
  wilaya text not null check (char_length(trim(wilaya)) between 2 and 80),
  course_id uuid references public.courses(id) on delete set null,
  session_id uuid references public.course_sessions(id) on delete set null,
  preferred_contact_method text not null default 'phone' check (preferred_contact_method in ('phone', 'whatsapp', 'email')),
  age_range text,
  profession text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'confirmed', 'paid', 'attended', 'cancelled', 'no_answer')),
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_page text,
  referrer text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists courses_status_featured_idx on public.courses(status, featured);
create index if not exists course_sessions_course_date_idx on public.course_sessions(course_id, start_date);
create index if not exists course_sessions_open_idx on public.course_sessions(registration_open, start_date);
create index if not exists registrations_status_created_idx on public.registrations(status, created_at desc);
create index if not exists registrations_course_idx on public.registrations(course_id);
create index if not exists registrations_session_idx on public.registrations(session_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trainers_set_updated_at on public.trainers;
create trigger trainers_set_updated_at before update on public.trainers for each row execute function public.set_updated_at();
drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses for each row execute function public.set_updated_at();
drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at before update on public.registrations for each row execute function public.set_updated_at();
drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.trainers enable row level security;
alter table public.courses enable row level security;
alter table public.course_sessions enable row level security;
alter table public.registrations enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories" on public.categories for select to anon, authenticated using (active = true);

drop policy if exists "Public can view trainers" on public.trainers;
create policy "Public can view trainers" on public.trainers for select to anon, authenticated using (true);

drop policy if exists "Public can view published courses" on public.courses;
create policy "Public can view published courses" on public.courses for select to anon, authenticated using (status = 'published');

drop policy if exists "Public can view open sessions" on public.course_sessions;
create policy "Public can view open sessions" on public.course_sessions for select to anon, authenticated using (registration_open = true);

drop policy if exists "Public can submit registrations" on public.registrations;
create policy "Public can submit registrations" on public.registrations for insert to anon, authenticated with check (status = 'new');

grant select on public.categories, public.trainers, public.courses, public.course_sessions to anon, authenticated;
grant insert on public.registrations to anon, authenticated;
