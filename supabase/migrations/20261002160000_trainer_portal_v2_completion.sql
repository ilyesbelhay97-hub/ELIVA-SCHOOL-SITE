-- Meritify Academy Trainer Portal V2 completion. Additive and idempotent.

create unique index if not exists trainer_profile_change_requests_one_pending
  on public.trainer_profile_change_requests(trainer_id)
  where status = 'pending';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trainer-profile-images', 'trainer-profile-images', true, 5242880,
  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists trainer_profile_images_public_read on storage.objects;
create policy trainer_profile_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'trainer-profile-images');

drop policy if exists trainer_profile_images_owner_insert on storage.objects;
create policy trainer_profile_images_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'trainer-profile-images'
    and (public.lms_is_admin() or public.trainer_portal_is_owner((storage.foldername(name))[2]::uuid))
  );

drop policy if exists trainer_profile_images_owner_update on storage.objects;
create policy trainer_profile_images_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'trainer-profile-images'
    and (public.lms_is_admin() or public.trainer_portal_is_owner((storage.foldername(name))[2]::uuid))
  )
  with check (
    bucket_id = 'trainer-profile-images'
    and (public.lms_is_admin() or public.trainer_portal_is_owner((storage.foldername(name))[2]::uuid))
  );

drop policy if exists trainer_profile_images_owner_delete on storage.objects;
create policy trainer_profile_images_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'trainer-profile-images'
    and (public.lms_is_admin() or public.trainer_portal_is_owner((storage.foldername(name))[2]::uuid))
  );

grant select on public.trainer_reviews to anon, authenticated;
