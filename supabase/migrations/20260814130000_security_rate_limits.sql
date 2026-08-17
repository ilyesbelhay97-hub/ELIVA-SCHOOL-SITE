-- Durable rate limits and publication guards for ELIVA public/admin endpoints.

create table if not exists public.api_rate_limits (
  key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon, authenticated;

create or replace function public.consume_api_rate_limit(p_key text, p_window_seconds integer, p_max_requests integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare current_row public.api_rate_limits;
begin
  if length(p_key) < 8 or p_window_seconds < 1 or p_max_requests < 1 then return false; end if;
  select * into current_row from public.api_rate_limits where key = p_key for update;
  if not found then
    insert into public.api_rate_limits(key, window_started_at, request_count) values (p_key, now(), 1);
    return true;
  end if;
  if now() - current_row.window_started_at >= make_interval(secs => p_window_seconds) then
    update public.api_rate_limits set window_started_at = now(), request_count = 1, updated_at = now() where key = p_key;
    return true;
  end if;
  if current_row.request_count >= p_max_requests then return false; end if;
  update public.api_rate_limits set request_count = request_count + 1, updated_at = now() where key = p_key;
  return true;
end;
$$;
revoke all on function public.consume_api_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer) to service_role;

create or replace function public.prevent_client_publication_changes()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if current_setting('request.jwt.claim.role', true) in ('anon', 'authenticated') then
    if tg_table_name = 'courses' and (new.publish_status is distinct from old.publish_status or new.published_at is distinct from old.published_at) then
      raise exception 'Publication changes must use the protected admin route';
    end if;
    if tg_table_name = 'trainers_crm' and (new.is_public is distinct from old.is_public or new.public_published_at is distinct from old.public_published_at) then
      raise exception 'Publication changes must use the protected admin route';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_course_publication_changes on public.courses;
create trigger protect_course_publication_changes before update on public.courses for each row execute function public.prevent_client_publication_changes();
drop trigger if exists protect_trainer_publication_changes on public.trainers_crm;
create trigger protect_trainer_publication_changes before update on public.trainers_crm for each row execute function public.prevent_client_publication_changes();
