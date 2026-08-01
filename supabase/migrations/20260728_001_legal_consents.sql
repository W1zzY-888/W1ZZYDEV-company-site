-- W1ZZYDEV legal consent proof migration.
-- Apply after existing chat/admin schemas. Do not run directly in production without backup and staging test.

create extension if not exists pgcrypto;

create table if not exists public.legal_documents (
  document_type text primary key,
  document_version text not null,
  document_url text not null,
  purpose_code text not null,
  content_snapshot text not null,
  document_hash text generated always as (encode(digest(content_snapshot, 'sha256'), 'hex')) stored,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint legal_documents_type_check check (document_type in ('privacy_policy','personal_data_consent','cookie_policy','terms','review_publication_consent'))
);

insert into public.legal_documents(document_type, document_version, document_url, purpose_code, content_snapshot, active)
values
('privacy_policy','2026-07-28-draft','/legal/privacy/','privacy_ack','Draft privacy policy v2026-07-28. Operator details are pending owner completion.', true),
('personal_data_consent','2026-07-28-draft','/legal/personal-data-consent/','personal_data_processing','Draft personal data consent v2026-07-28. Operator details are pending owner completion.', true),
('review_publication_consent','2026-07-28-draft','/legal/personal-data-consent/','review_submission_and_publication','Draft separate review publication consent v2026-07-28.', true),
('cookie_policy','2026-07-28-draft','/legal/cookies/','cookie_storage_choice','Draft cookie/storage policy v2026-07-28.', true)
on conflict (document_type) do update
set document_version = excluded.document_version,
    document_url = excluded.document_url,
    purpose_code = excluded.purpose_code,
    content_snapshot = excluded.content_snapshot,
    active = excluded.active;

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  subject_type text,
  conversation_id uuid null,
  lead_id uuid null,
  client_id uuid null,
  review_id uuid null,
  request_id uuid null,
  purpose_code text not null,
  document_type text not null,
  document_version text not null,
  document_url text not null,
  document_hash text not null,
  consent_text_snapshot text not null,
  accepted boolean not null,
  accepted_at timestamptz not null default now(),
  withdrawn_at timestamptz null,
  source_page text not null,
  form_id text not null,
  session_id_hash text null,
  ip_hash text null,
  user_agent_reduced text null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint legal_consents_accepted_true check (accepted is true),
  constraint legal_consents_purpose_check check (purpose_code in ('lead_request','support_request','chat_message','client_auth','client_message','review_submission_and_publication','data_subject_request','cookie_storage_choice')),
  constraint legal_consents_document_type_check check (document_type in ('personal_data_consent','privacy_policy','review_publication_consent','cookie_policy'))
);

alter table public.legal_documents enable row level security;
alter table public.legal_consents enable row level security;
revoke all on public.legal_documents from anon, authenticated;
revoke all on public.legal_consents from anon, authenticated;
grant select on public.legal_documents to anon, authenticated;
grant select on public.legal_consents to authenticated;

drop policy if exists "public reads active legal documents" on public.legal_documents;
create policy "public reads active legal documents" on public.legal_documents
for select to anon, authenticated using (active is true);

drop policy if exists "owner reads legal consents" on public.legal_consents;
create policy "owner reads legal consents" on public.legal_consents
for select to authenticated using (public.is_owner());

create or replace function public.legal_hmac_sha256(value text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  secret text := current_setting('app.legal_hmac_secret', true);
begin
  if value is null or trim(value) = '' or secret is null or secret = '' then
    return null;
  end if;
  return encode(hmac(convert_to(left(value, 500), 'utf8'), convert_to(secret, 'utf8'), 'sha256'), 'hex');
end;
$$;

create or replace function public.legal_reduced_user_agent()
returns text
language plpgsql
stable
as $$
declare headers jsonb;
begin
  begin
    headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then
    return null;
  end;
  return left(regexp_replace(coalesce(headers->>'user-agent',''), '\s+', ' ', 'g'), 180);
end;
$$;

create or replace function public.register_legal_consent(
  p_purpose_code text,
  p_document_type text,
  p_form_id text,
  p_source_page text,
  p_session_id text default null,
  p_conversation_id uuid default null,
  p_lead_id uuid default null,
  p_client_id uuid default null,
  p_review_id uuid default null,
  p_request_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  doc public.legal_documents%rowtype;
  consent_id uuid;
  raw_ip text := public.safe_request_ip();
begin
  if p_form_id not in ('project-form','home-project-form','support-ticket-form','review-form','client-login-form','client-message-form','chat-start-form','chat-reply-form','data-request-form','cookie-settings') then
    raise exception 'Unsupported legal form';
  end if;

  select * into doc
  from public.legal_documents
  where document_type = p_document_type
    and active is true
  limit 1;

  if doc.document_type is null then
    raise exception 'Active legal document is not configured';
  end if;

  if p_purpose_code not in ('lead_request','support_request','chat_message','client_auth','client_message','review_submission_and_publication','data_subject_request','cookie_storage_choice') then
    raise exception 'Unsupported consent purpose';
  end if;

  insert into public.legal_consents(
    subject_type, conversation_id, lead_id, client_id, review_id, request_id,
    purpose_code, document_type, document_version, document_url, document_hash,
    consent_text_snapshot, accepted, accepted_at, source_page, form_id,
    session_id_hash, ip_hash, user_agent_reduced, metadata
  )
  values (
    case when auth.uid() is null then 'visitor' else 'authenticated_user' end,
    p_conversation_id, p_lead_id, p_client_id, p_review_id, p_request_id,
    p_purpose_code, doc.document_type, doc.document_version, doc.document_url, doc.document_hash,
    doc.content_snapshot, true, now(), left(coalesce(p_source_page,''), 600), p_form_id,
    public.legal_hmac_sha256(p_session_id), public.legal_hmac_sha256(raw_ip), public.legal_reduced_user_agent(),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into consent_id;

  return consent_id;
end;
$$;

revoke execute on function public.register_legal_consent(text,text,text,text,text,uuid,uuid,uuid,uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.register_legal_consent(text,text,text,text,text,uuid,uuid,uuid,uuid,uuid,jsonb) to anon, authenticated;

comment on table public.legal_consents is 'Immutable evidence of accepted legal documents. No public select/insert/update/delete; writes only via SECURITY DEFINER RPC.';
