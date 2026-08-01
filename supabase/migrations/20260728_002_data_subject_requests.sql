-- W1ZZYDEV data subject requests.
-- Apply after 20260728_001_legal_consents.sql.

create extension if not exists pgcrypto;

create table if not exists public.data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null,
  subject_name text not null,
  reply_contact text not null,
  description text not null,
  status text not null default 'new',
  identity_verification_status text not null default 'not_started',
  received_at timestamptz not null default now(),
  due_at timestamptz not null default (now() + interval '30 days'),
  completed_at timestamptz,
  assigned_admin_id uuid,
  resolution_summary text,
  legal_basis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint data_subject_requests_type_check check (request_type in ('access','rectification','restriction','stop_processing','erasure','withdraw_consent')),
  constraint data_subject_requests_status_check check (status in ('new','identity_check','in_progress','completed','rejected_with_reason','cancelled')),
  constraint data_subject_requests_identity_check check (identity_verification_status in ('not_started','requested','verified','failed','not_required')),
  constraint data_subject_requests_lengths check (
    char_length(subject_name) between 1 and 80
    and char_length(reply_contact) between 3 and 160
    and char_length(description) between 1 and 2000
    and subject_name !~ '[<>]'
    and reply_contact !~ '[<>]'
    and description !~ '[<>]'
  )
);

alter table public.data_subject_requests enable row level security;
revoke all on public.data_subject_requests from anon, authenticated;
grant select, update on public.data_subject_requests to authenticated;

drop policy if exists "owner manages data subject requests" on public.data_subject_requests;
create policy "owner manages data subject requests" on public.data_subject_requests
for all to authenticated using (public.is_owner()) with check (public.is_owner());

create or replace function public.create_data_subject_request(
  p_request_type text,
  p_subject_name text,
  p_reply_contact text,
  p_description text,
  p_consent_accepted boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_id uuid;
begin
  if p_consent_accepted is not true then
    raise exception 'Personal data consent is required';
  end if;
  insert into public.data_subject_requests(request_type, subject_name, reply_contact, description)
  values (
    p_request_type,
    left(trim(regexp_replace(coalesce(p_subject_name,''), '\s+', ' ', 'g')), 80),
    left(trim(regexp_replace(coalesce(p_reply_contact,''), '\s+', ' ', 'g')), 160),
    left(trim(coalesce(p_description,'')), 2000)
  )
  returning id into request_id;

  perform public.register_legal_consent(
    'data_subject_request',
    'personal_data_consent',
    'data-request-form',
    '/legal/data-request/',
    null,
    null, null, null, null, request_id,
    jsonb_build_object('request_type', p_request_type)
  );

  return request_id;
end;
$$;

revoke execute on function public.create_data_subject_request(text,text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.create_data_subject_request(text,text,text,text,boolean) to anon, authenticated;
