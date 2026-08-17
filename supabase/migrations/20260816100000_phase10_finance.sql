-- ELIVA SCHOOL — Phase 10 final finance migration
-- Idempotent extension of the Phase 9 admissions ledger. No legacy rows are deleted.

create extension if not exists "uuid-ossp";
create sequence if not exists public.finance_receipt_number_seq;

create table if not exists public.finance_collection_points (
  id uuid primary key default uuid_generate_v4(), name text not null,
  point_type text not null check (point_type in ('eliva_branch','partner_center','online','other')),
  wilaya text, center_id uuid references public.centers(id) on delete restrict,
  is_active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.finance_payments (
  id uuid primary key default uuid_generate_v4(), registration_id uuid not null references public.registrations(id) on delete restrict,
  collection_point_id uuid references public.finance_collection_points(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0), currency text not null default 'DZD',
  payment_method text not null check (payment_method in ('cash','baridimob','ccp','bank_transfer','card','other')),
  payment_date timestamptz not null default now(), collection_owner text not null check (collection_owner in ('eliva','partner_center')),
  status text not null default 'pending' check (status in ('pending','verified','rejected','voided')),
  transaction_reference text, receipt_reference text, receipt_path text not null, receipt_mime_type text, receipt_size_bytes bigint,
  receipt_number text, receipt_verification_token text,
  receipt_status text not null default 'pending' check (receipt_status in ('pending','valide','annule','corrige')),
  payment_type text not null default 'versement' check (payment_type in ('versement','total')),
  rejection_reason text, notes text, received_by uuid references auth.users(id) on delete set null,
  verified_by uuid references auth.users(id) on delete set null, verified_at timestamptz,
  voided_by uuid references auth.users(id) on delete set null, voided_at timestamptz,
  corrected_by uuid references auth.users(id) on delete set null, corrected_at timestamptz,
  correction_of_id uuid references public.finance_payments(id) on delete restrict, correction_reason text,
  legacy_admission_payment_id uuid, source_system text not null default 'finance',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.finance_payments add column if not exists receipt_reference text;
alter table public.finance_payments add column if not exists receipt_number text;
alter table public.finance_payments add column if not exists receipt_verification_token text;
alter table public.finance_payments add column if not exists receipt_status text not null default 'pending';
alter table public.finance_payments add column if not exists payment_type text not null default 'versement';
alter table public.finance_payments add column if not exists corrected_by uuid references auth.users(id) on delete set null;
alter table public.finance_payments add column if not exists corrected_at timestamptz;
alter table public.finance_payments add column if not exists correction_of_id uuid references public.finance_payments(id) on delete restrict;
alter table public.finance_payments add column if not exists source_system text not null default 'finance';
create unique index if not exists finance_payments_legacy_unique on public.finance_payments(legacy_admission_payment_id) where legacy_admission_payment_id is not null;
create unique index if not exists finance_payments_receipt_number_unique on public.finance_payments(receipt_number) where receipt_number is not null;
create unique index if not exists finance_payments_receipt_token_unique on public.finance_payments(receipt_verification_token) where receipt_verification_token is not null;
create index if not exists finance_payments_registration_date_idx on public.finance_payments(registration_id, payment_date desc, created_at desc);
create index if not exists finance_payments_status_idx on public.finance_payments(status, payment_date desc);

create table if not exists public.finance_cash_sessions (
  id uuid primary key default uuid_generate_v4(), collection_point_id uuid not null references public.finance_collection_points(id) on delete restrict,
  business_date date not null, opened_by uuid references auth.users(id) on delete set null, opening_cash numeric(12,2) not null default 0 check (opening_cash >= 0),
  theoretical_cash numeric(12,2), actual_cash numeric(12,2), cash_difference numeric(12,2), closing_note text,
  closed_by uuid references auth.users(id) on delete set null, opened_at timestamptz not null default now(), closed_at timestamptz,
  status text not null default 'open' check (status in ('open','closed')), unique(collection_point_id, business_date)
);

create table if not exists public.finance_partner_settlements (
  id uuid primary key default uuid_generate_v4(), center_id uuid not null references public.centers(id) on delete restrict,
  course_id uuid references public.courses(id) on delete restrict, session_label text, period_start date, period_end date,
  gross_collected numeric(12,2) not null default 0 check (gross_collected >= 0), hall_fee numeric(12,2) not null default 0 check (hall_fee >= 0),
  center_commission numeric(12,2) not null default 0 check (center_commission >= 0), other_deductions numeric(12,2) not null default 0 check (other_deductions >= 0),
  net_due_eliva numeric(12,2) not null default 0, transferred_to_eliva numeric(12,2) not null default 0 check (transferred_to_eliva >= 0),
  status text not null default 'pending' check (status in ('pending','partial','settled','disputed','voided')),
  settlement_proof_path text, notes text, created_by uuid references auth.users(id) on delete set null,
  verified_by uuid references auth.users(id) on delete set null, verified_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists public.finance_events (
  id uuid primary key default uuid_generate_v4(), payment_id uuid references public.finance_payments(id) on delete restrict,
  registration_id uuid references public.registrations(id) on delete restrict, event_type text not null, label text not null,
  metadata jsonb not null default '{}'::jsonb, reason text, actor_id uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);

create table if not exists public.finance_settings (
  id boolean primary key default true check (id), official_name text not null default 'ELIVA SCHOOL', logo_path text, address text, wilaya text,
  phone text, whatsapp text, email text, website text, receipt_prefix text not null default 'ELIVA-SK', receipt_footer text,
  rc text, nif text, nis text, ai text, updated_by uuid references auth.users(id) on delete set null, updated_at timestamptz not null default now()
);
insert into public.finance_settings(id) values (true) on conflict (id) do nothing;

alter table public.registrations add column if not exists catalog_price numeric(12,2);
alter table public.registrations add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.registrations add column if not exists discount_percent numeric(5,2);
alter table public.registrations add column if not exists discount_reason text;
alter table public.registrations add column if not exists discount_approved_by uuid references auth.users(id) on delete set null;
alter table public.registrations add column if not exists discount_approved_at timestamptz;
alter table public.registrations add column if not exists next_payment_due_date date;

-- Copy Phase 9 records once. The legacy ID is retained as the bridge key.
insert into public.finance_payments (id, registration_id, amount, currency, payment_method, payment_date, collection_owner, status, transaction_reference, receipt_path, receipt_mime_type, receipt_size_bytes, rejection_reason, notes, received_by, verified_by, verified_at, voided_by, voided_at, correction_reason, legacy_admission_payment_id, source_system, created_at, updated_at)
select p.id, p.registration_id, p.amount, p.currency, p.payment_method, p.payment_date::timestamptz, 'eliva', p.verification_status, p.transaction_reference, p.receipt_path, p.receipt_mime_type, p.receipt_size_bytes, p.rejection_reason, p.notes, p.created_by, p.verified_by, p.verified_at, p.voided_by, p.voided_at, p.correction_reason, p.id, 'admissions_phase9_migration', p.created_at, p.updated_at
from public.admission_payments p
where not exists (select 1 from public.finance_payments f where f.legacy_admission_payment_id = p.id or f.id = p.id);

create or replace view public.finance_student_balances with (security_invoker = true) as
select r.id registration_id,
  coalesce(r.agreed_total_amount, 0)::numeric(12,2) total_due,
  coalesce(sum(case when p.status='verified' and p.voided_at is null then p.amount else 0 end),0)::numeric(12,2) paid_verified,
  greatest(coalesce(r.agreed_total_amount,0)-coalesce(sum(case when p.status='verified' and p.voided_at is null then p.amount else 0 end),0),0)::numeric(12,2) remaining,
  count(*) filter (where p.status='pending' and p.voided_at is null) pending_count,
  coalesce(r.catalog_price, r.agreed_total_amount, 0)::numeric(12,2) catalog_price,
  coalesce(r.discount_amount, 0)::numeric(12,2) discount_amount,
  case when coalesce(sum(case when p.status='verified' and p.voided_at is null then p.amount else 0 end),0)>coalesce(r.agreed_total_amount,0) then 'overpaid'
    when coalesce(sum(case when p.status='verified' and p.voided_at is null then p.amount else 0 end),0)=0 and count(*) filter (where p.status='pending' and p.voided_at is null)>0 then 'pending'
    when coalesce(sum(case when p.status='verified' and p.voided_at is null then p.amount else 0 end),0)=0 then 'unpaid'
    when coalesce(sum(case when p.status='verified' and p.voided_at is null then p.amount else 0 end),0)<coalesce(r.agreed_total_amount,0) then 'partial' else 'complete' end financial_status
from public.registrations r left join public.finance_payments p on p.registration_id=r.id group by r.id,r.catalog_price,r.discount_amount,r.agreed_total_amount;

create or replace view public.admission_payment_summary with (security_invoker = true) as
select registration_id, total_due, paid_verified as total_verified_paid, remaining as remaining_amount, pending_count as pending_payments from public.finance_student_balances;

create or replace view public.finance_partner_settlement_balances with (security_invoker = true) as
select s.*, greatest(s.net_due_eliva-s.transferred_to_eliva,0)::numeric(12,2) remaining_due,
  case when s.status='voided' then 'voided' when s.transferred_to_eliva>=s.net_due_eliva and s.net_due_eliva>0 then 'settled' when s.transferred_to_eliva>0 then 'partial' else s.status end calculated_status
from public.finance_partner_settlements s;

create or replace function public.finance_set_settlement_totals() returns trigger language plpgsql security invoker set search_path=public as $$
begin
  new.net_due_eliva:=greatest(new.gross_collected-new.hall_fee-new.center_commission-new.other_deductions,0);
  if new.status<>'voided' then new.status:=case when new.transferred_to_eliva>=new.net_due_eliva and new.net_due_eliva>0 then 'settled' when new.transferred_to_eliva>0 then 'partial' else 'pending' end; end if;
  return new;
end; $$;
drop trigger if exists finance_settlement_totals on public.finance_partner_settlements;
create trigger finance_settlement_totals before insert or update on public.finance_partner_settlements for each row execute function public.finance_set_settlement_totals();

create or replace function public.finance_set_cash_close() returns trigger language plpgsql security invoker set search_path=public as $$
declare v_cash numeric(12,2);
begin
  if new.status='closed' then
    select coalesce(sum(p.amount),0) into v_cash from public.finance_payments p where p.collection_point_id=new.collection_point_id and p.payment_method='cash' and p.collection_owner='eliva' and p.status='verified' and p.voided_at is null and p.payment_date::date=new.business_date;
    new.theoretical_cash:=new.opening_cash+v_cash;
    if new.actual_cash is null then raise exception 'actual_cash is required to close a cash session'; end if;
    new.cash_difference:=new.actual_cash-new.theoretical_cash;
    if new.cash_difference<>0 and length(trim(coalesce(new.closing_note,'')))<3 then raise exception 'A reason is required for a cash difference'; end if;
    new.closed_at:=coalesce(new.closed_at,now());
  end if; return new;
end; $$;
drop trigger if exists finance_cash_close on public.finance_cash_sessions;
create trigger finance_cash_close before update on public.finance_cash_sessions for each row execute function public.finance_set_cash_close();

create or replace function public.finance_protect_verified_payment() returns trigger language plpgsql security invoker set search_path=public as $$
begin
  if old.status='verified' and new.status='verified' and (new.registration_id<>old.registration_id or new.amount<>old.amount or new.payment_method<>old.payment_method or new.payment_date<>old.payment_date or new.collection_owner<>old.collection_owner) then raise exception 'Verified payments require a correction workflow'; end if;
  if old.status='verified' and new.status='voided' and length(trim(coalesce(new.correction_reason,'')))<3 then raise exception 'A correction reason is required'; end if;
  return new;
end; $$;
drop trigger if exists finance_protect_verified on public.finance_payments;
create trigger finance_protect_verified before update on public.finance_payments for each row execute function public.finance_protect_verified_payment();

create or replace function public.finance_issue_receipt_number() returns text language plpgsql security definer set search_path=public as $$
declare v_prefix text; v_number bigint;
begin select receipt_prefix into v_prefix from public.finance_settings where id=true; v_number:=nextval('public.finance_receipt_number_seq'); return coalesce(nullif(v_prefix,''),'ELIVA-SK')||'-'||to_char(current_date,'YYYY')||'-'||lpad(v_number::text,6,'0'); end; $$;
revoke all on function public.finance_issue_receipt_number() from public, anon, authenticated;
grant execute on function public.finance_issue_receipt_number() to service_role;

alter table public.finance_collection_points enable row level security;
alter table public.finance_payments enable row level security;
alter table public.finance_cash_sessions enable row level security;
alter table public.finance_partner_settlements enable row level security;
alter table public.finance_events enable row level security;
alter table public.finance_settings enable row level security;
do $$ begin
  execute 'drop policy if exists finance_admin_collection_points on public.finance_collection_points'; execute 'create policy finance_admin_collection_points on public.finance_collection_points for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
  execute 'drop policy if exists finance_admin_payments on public.finance_payments'; execute 'create policy finance_admin_payments on public.finance_payments for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
  execute 'drop policy if exists finance_admin_cash_sessions on public.finance_cash_sessions'; execute 'create policy finance_admin_cash_sessions on public.finance_cash_sessions for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
  execute 'drop policy if exists finance_admin_settlements on public.finance_partner_settlements'; execute 'create policy finance_admin_settlements on public.finance_partner_settlements for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
  execute 'drop policy if exists finance_admin_events on public.finance_events'; execute 'create policy finance_admin_events on public.finance_events for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
  execute 'drop policy if exists finance_admin_settings on public.finance_settings'; execute 'create policy finance_admin_settings on public.finance_settings for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
end $$;

insert into public.finance_collection_points(name,point_type,wilaya) select 'ELIVA SCHOOL — Skikda','eliva_branch','Skikda' where not exists(select 1 from public.finance_collection_points where lower(name)=lower('ELIVA SCHOOL — Skikda'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('finance-proofs','finance-proofs',false,5242880,array['application/pdf','image/jpeg','image/png','image/webp']::text[]) on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists finance_admin_proofs on storage.objects;
create policy finance_admin_proofs on storage.objects for all to authenticated using(bucket_id='finance-proofs' and public.eliva_is_admin()) with check(bucket_id='finance-proofs' and public.eliva_is_admin());
revoke all on public.finance_collection_points,public.finance_payments,public.finance_cash_sessions,public.finance_partner_settlements,public.finance_events,public.finance_settings,public.finance_student_balances,public.finance_partner_settlement_balances from anon;
revoke all on public.finance_collection_points,public.finance_payments,public.finance_cash_sessions,public.finance_partner_settlements,public.finance_events,public.finance_settings,public.finance_student_balances,public.finance_partner_settlement_balances from authenticated;
grant select,insert,update,delete on public.finance_collection_points,public.finance_payments,public.finance_cash_sessions,public.finance_partner_settlements,public.finance_events,public.finance_settings to authenticated;
