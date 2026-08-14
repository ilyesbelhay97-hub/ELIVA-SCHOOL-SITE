-- ELIVA SCHOOL Phase 9: admissions workflow and private payment receipts.
-- Idempotent: run after FINAL_SUPABASE_SETUP.sql. Existing registrations are preserved.

alter table public.registrations
  add column if not exists admission_stage text not null default 'prospect',
  add column if not exists prospect_status text not null default 'new',
  add column if not exists pre_registration_status text,
  add column if not exists student_status text,
  add column if not exists last_contact_result text,
  add column if not exists next_followup_date date,
  add column if not exists pre_registered_at timestamptz,
  add column if not exists dossier_completed_at timestamptz,
  add column if not exists final_registered_at timestamptz,
  add column if not exists training_started_at timestamptz,
  add column if not exists training_completed_at timestamptz,
  add column if not exists agreed_total_amount numeric(12,2),
  add column if not exists payment_notes text,
  add column if not exists dossier_notes text;

alter table public.registrations drop constraint if exists registrations_admission_stage_check;
alter table public.registrations add constraint registrations_admission_stage_check check (admission_stage in ('prospect','pre_registration','student'));
alter table public.registrations drop constraint if exists registrations_prospect_status_check;
alter table public.registrations add constraint registrations_prospect_status_check check (prospect_status in ('new','to_contact','contact_in_progress','interested','thinking','callback_later','not_interested','unreachable_after_3'));
alter table public.registrations drop constraint if exists registrations_pre_registration_status_check;
alter table public.registrations add constraint registrations_pre_registration_status_check check (pre_registration_status is null or pre_registration_status in ('pre_registered','dossier_pending','appointment_scheduled','dossier_partial','dossier_not_finalized','dossier_complete','online_pre_registered','payment_pending','payment_proof_received','payment_to_verify','payment_partial','payment_complete'));
alter table public.registrations drop constraint if exists registrations_student_status_check;
alter table public.registrations add constraint registrations_student_status_check check (student_status is null or student_status in ('registered','active','training_in_progress','training_completed','certified','withdrawn'));
create index if not exists registrations_admission_stage_idx on public.registrations(admission_stage);
create index if not exists registrations_next_followup_date_idx on public.registrations(next_followup_date);

create table if not exists public.admission_attempts (
  id uuid primary key default uuid_generate_v4(), registration_id uuid not null references public.registrations(id) on delete cascade,
  attempt_type text not null check (attempt_type in ('initial_contact','dossier_followup')), attempt_number smallint not null check (attempt_number between 1 and 3),
  attempt_date date not null default current_date, result text not null check (result in ('no_answer','phone_off','answered_interested','answered_thinking','callback_later','not_interested','pre_registered','appointment_scheduled','dossier_still_pending','dossier_partial','dossier_complete')),
  notes text, next_attempt_date date, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);
create unique index if not exists admission_attempts_one_per_day_idx on public.admission_attempts(registration_id, attempt_type, attempt_date);
create unique index if not exists admission_attempts_number_unique_idx on public.admission_attempts(registration_id, attempt_type, attempt_number);
create index if not exists admission_attempts_registration_idx on public.admission_attempts(registration_id, created_at desc);

create table if not exists public.admission_events (
  id uuid primary key default uuid_generate_v4(), registration_id uuid not null references public.registrations(id) on delete cascade, event_type text not null, event_label text not null, metadata jsonb not null default '{}'::jsonb, notes text, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);
create index if not exists admission_events_registration_idx on public.admission_events(registration_id, created_at desc);

create table if not exists public.admission_documents (
  id uuid primary key default uuid_generate_v4(), registration_id uuid not null references public.registrations(id) on delete cascade, document_name text not null, is_required boolean not null default true, is_received boolean not null default false, received_at timestamptz, notes text, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists admission_documents_registration_idx on public.admission_documents(registration_id);

create table if not exists public.admission_payments (
  id uuid primary key default uuid_generate_v4(), registration_id uuid not null references public.registrations(id) on delete cascade, amount numeric(12,2) not null check (amount > 0), currency text not null default 'DZD', payment_method text not null check (payment_method in ('baridimob','ccp','bank_transfer','cash','other')), payment_date date not null, transaction_reference text, receipt_path text not null, receipt_mime_type text, receipt_size_bytes bigint, verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','voided')), verified_by uuid references auth.users(id) on delete set null, verified_at timestamptz, rejection_reason text, correction_reason text, voided_at timestamptz, voided_by uuid references auth.users(id) on delete set null, notes text, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists admission_payments_registration_idx on public.admission_payments(registration_id, created_at desc);
create index if not exists admission_payments_verification_idx on public.admission_payments(verification_status);

create or replace view public.admission_payment_summary with (security_invoker = true) as
select r.id registration_id, coalesce(r.agreed_total_amount,0)::numeric(12,2) total_due,
  coalesce(sum(case when p.verification_status='verified' and p.voided_at is null then p.amount else 0 end),0)::numeric(12,2) total_verified_paid,
  greatest(coalesce(r.agreed_total_amount,0)-coalesce(sum(case when p.verification_status='verified' and p.voided_at is null then p.amount else 0 end),0),0)::numeric(12,2) remaining_amount,
  count(*) filter (where p.verification_status='pending' and p.voided_at is null) pending_payments
from public.registrations r left join public.admission_payments p on p.registration_id=r.id group by r.id,r.agreed_total_amount;

create or replace function public.record_admission_attempt(p_registration_id uuid,p_attempt_type text,p_result text,p_notes text default null)
returns public.admission_attempts language plpgsql security invoker set search_path=public as $function$
declare v_count integer; v_num integer; v_next date; v_row public.admission_attempts;
begin
  if p_attempt_type not in ('initial_contact','dossier_followup') then raise exception 'Invalid attempt type'; end if;
  if exists(select 1 from public.admission_attempts where registration_id=p_registration_id and attempt_type=p_attempt_type and attempt_date=current_date) then raise exception 'Only one attempt of this type is allowed per day'; end if;
  select count(*) into v_count from public.admission_attempts where registration_id=p_registration_id and attempt_type=p_attempt_type; if v_count>=3 then raise exception 'Maximum of three attempts reached'; end if;
  v_num:=v_count+1; v_next:=case when (p_attempt_type='initial_contact' and p_result in ('no_answer','phone_off') or p_attempt_type='dossier_followup' and p_result in ('dossier_still_pending','dossier_partial')) and v_num<3 then current_date+1 else null end;
  insert into public.admission_attempts(registration_id,attempt_type,attempt_number,result,notes,next_attempt_date,created_by) values(p_registration_id,p_attempt_type,v_num,p_result,p_notes,v_next,auth.uid()) returning * into v_row;
  update public.registrations set last_contact_result=p_result,next_followup_date=v_next,updated_at=now() where id=p_registration_id;
  insert into public.admission_events(registration_id,event_type,event_label,metadata,notes,created_by) values(p_registration_id,'attempt',case when p_attempt_type='initial_contact' then 'Tentative de contact '||v_num||'/3' else 'Relance dossier '||v_num||'/3' end,jsonb_build_object('attempt_type',p_attempt_type,'attempt_number',v_num,'result',p_result),p_notes,auth.uid());
  if p_attempt_type='initial_contact' and p_result='answered_interested' then update public.registrations set prospect_status='interested' where id=p_registration_id; end if;
  if p_attempt_type='initial_contact' and p_result='answered_thinking' then update public.registrations set prospect_status='thinking' where id=p_registration_id; end if;
  if p_attempt_type='initial_contact' and p_result='callback_later' then update public.registrations set prospect_status='callback_later' where id=p_registration_id; end if;
  if p_attempt_type='initial_contact' and p_result='not_interested' then update public.registrations set prospect_status='not_interested' where id=p_registration_id; end if;
  if p_attempt_type='dossier_followup' and p_result='dossier_complete' then update public.registrations set pre_registration_status='dossier_complete',dossier_completed_at=coalesce(dossier_completed_at,now()),next_followup_date=null where id=p_registration_id; end if;
  if p_attempt_type='initial_contact' and p_result in ('no_answer','phone_off') and v_num=3 then update public.registrations set prospect_status='unreachable_after_3',next_followup_date=null where id=p_registration_id; end if;
  if p_attempt_type='dossier_followup' and p_result in ('dossier_still_pending','dossier_partial') and v_num=3 then update public.registrations set pre_registration_status='dossier_not_finalized',next_followup_date=null where id=p_registration_id; end if;
  return v_row;
end $function$;

create or replace function public.move_to_pre_registration(p_registration_id uuid,p_study_mode text,p_agreed_total_amount numeric default null)
returns void language plpgsql security invoker set search_path=public as $function$
begin
  if p_study_mode not in ('presentiel','online') then raise exception 'Invalid study mode'; end if;
  update public.registrations set admission_stage='pre_registration',study_mode=p_study_mode,pre_registered_at=coalesce(pre_registered_at,now()),agreed_total_amount=coalesce(p_agreed_total_amount,agreed_total_amount),pre_registration_status=case when p_study_mode='online' then 'payment_pending' else 'dossier_pending' end,next_followup_date=case when p_study_mode='presentiel' then current_date else null end,updated_at=now() where id=p_registration_id;
  insert into public.admission_events(registration_id,event_type,event_label,metadata,created_by) values(p_registration_id,'stage_change','Passage en pré-inscription',jsonb_build_object('stage','pre_registration','study_mode',p_study_mode),auth.uid());
end $function$;

create or replace function public.confirm_final_registration(p_registration_id uuid)
returns void language plpgsql security invoker set search_path=public as $function$
declare v_mode text; v_pre text; v_due numeric; v_paid numeric;
begin
  select study_mode,pre_registration_status,coalesce(agreed_total_amount,0) into v_mode,v_pre,v_due from public.registrations where id=p_registration_id; if not found then raise exception 'Registration not found'; end if;
  if v_mode='presentiel' and v_pre<>'dossier_complete' then raise exception 'Presentiel dossier must be complete before final registration'; end if;
  if v_mode='online' then select coalesce(total_verified_paid,0) into v_paid from public.admission_payment_summary where registration_id=p_registration_id; if v_due>0 and v_paid<v_due then raise exception 'Online payment is not complete'; end if; end if;
  update public.registrations set admission_stage='student',student_status='registered',final_registered_at=coalesce(final_registered_at,now()),next_followup_date=null,updated_at=now() where id=p_registration_id;
  insert into public.admission_events(registration_id,event_type,event_label,metadata,created_by) values(p_registration_id,'stage_change','Inscription finale confirmée',jsonb_build_object('stage','student'),auth.uid());
end $function$;

alter table public.admission_attempts enable row level security; alter table public.admission_events enable row level security; alter table public.admission_documents enable row level security; alter table public.admission_payments enable row level security;
do $policies$ begin
  execute 'drop policy if exists "admin_admission_attempts" on public.admission_attempts'; execute 'create policy "admin_admission_attempts" on public.admission_attempts for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
  execute 'drop policy if exists "admin_admission_events" on public.admission_events'; execute 'create policy "admin_admission_events" on public.admission_events for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
  execute 'drop policy if exists "admin_admission_documents" on public.admission_documents'; execute 'create policy "admin_admission_documents" on public.admission_documents for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
  execute 'drop policy if exists "admin_admission_payments" on public.admission_payments'; execute 'create policy "admin_admission_payments" on public.admission_payments for all to authenticated using (public.eliva_is_admin()) with check (public.eliva_is_admin())';
end $policies$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('payment-receipts','payment-receipts',false,5242880,array['image/jpeg','image/png','image/webp']::text[]) on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "admin_read_payment_receipts" on storage.objects;
create policy "admin_read_payment_receipts" on storage.objects for select to authenticated using (bucket_id='payment-receipts' and public.eliva_is_admin());
drop policy if exists "admin_write_payment_receipts" on storage.objects;
create policy "admin_write_payment_receipts" on storage.objects for all to authenticated using (bucket_id='payment-receipts' and public.eliva_is_admin()) with check (bucket_id='payment-receipts' and public.eliva_is_admin());

-- These objects are accessed by the protected Next.js admin route with the service key.
-- Keep them out of anonymous REST/GraphQL discovery; RLS remains enabled for defense in depth.
revoke all on public.admission_attempts, public.admission_events, public.admission_documents, public.admission_payments, public.admission_payment_summary from anon;
revoke execute on function public.record_admission_attempt(uuid,text,text,text), public.move_to_pre_registration(uuid,text,numeric), public.confirm_final_registration(uuid) from anon, authenticated;
