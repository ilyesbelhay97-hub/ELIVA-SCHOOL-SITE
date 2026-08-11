alter function public.set_updated_at() set search_path = public;

drop policy if exists "No public access to site settings" on public.site_settings;
create policy "No public access to site settings" on public.site_settings for select to anon, authenticated using (false);
