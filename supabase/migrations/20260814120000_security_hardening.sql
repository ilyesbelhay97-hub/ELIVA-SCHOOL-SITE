-- ELIVA SCHOOL security hardening.
-- Idempotent and non-destructive. Keeps public trainer data column-scoped.

alter function public.set_updated_at() set search_path = public;
alter view public.public_trainers_cms set (security_invoker = true);

drop policy if exists "public_read_public_trainers" on public.trainers_crm;
create policy "public_read_public_trainers"
  on public.trainers_crm for select to anon
  using (is_public = true);

revoke all on public.trainers_crm from anon;
grant select (
  id, full_name, public_slug, is_public,
  public_title_fr, public_title_ar, public_bio_fr, public_bio_ar,
  public_expertise_fr, public_expertise_ar, public_credentials_fr,
  public_credentials_ar, public_photo_path, public_order,
  public_seo_title_fr, public_seo_title_ar,
  public_seo_description_fr, public_seo_description_ar
) on public.trainers_crm to anon;
grant select on public.public_trainers_cms to anon, authenticated;

-- Anonymous visitors may submit a registration, but cannot discover or mutate CRM rows.
revoke all on public.registrations from anon;
grant insert on public.registrations to anon;
revoke all on public.trainers_crm, public.trainer_interactions,
  public.centers, public.center_interactions,
  public.admission_attempts, public.admission_events,
  public.admission_documents, public.admission_payments,
  public.admission_payment_summary from anon;
