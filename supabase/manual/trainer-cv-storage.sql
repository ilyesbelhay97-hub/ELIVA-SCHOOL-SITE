-- Run once in the Supabase SQL editor after reviewing your project.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trainer-cv', 'trainer-cv', false, 5242880, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['application/pdf'];

-- CV uploads and downloads are performed server-side with the service-role key.
-- No anon/authenticated storage policy is intentionally created.
