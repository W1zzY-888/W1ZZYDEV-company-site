-- W1ZZYDEV universal support/chat widget schema delta.
-- Run after supabase/admin-panel-schema.sql and supabase/client-portal-schema.sql.
-- Idempotent: safe to run more than once. Does not delete existing data.

create extension if not exists pgcrypto;

alter table public.conversations add column if not exists category text not null default 'question';
alter table public.conversations add column if not exists status text not null default 'open';
alter table public.conversations add column if not exists page_url text;
alter table public.conversations add column if not exists last_guest_seen_at timestamptz;

alter table public.conversations
  drop constraint if exists conversations_category_check,
  add constraint conversations_category_check
  check (category in ('project','consultation','question','support')) not valid;

alter table public.conversations
  drop constraint if exists conversations_status_check,
  add constraint conversations_status_check
  check (status in ('open','in_progress','waiting_client','closed','resolved')) not valid;

create table if not exists public.guest_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  guest_token_hash text not null,
  request_ip text,
  page_url text,
  expires_at timestamptz not null default (now() + interval '30 days'),
  revoked_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint guest_sessions_token_hash_length check (char_length(guest_token_hash) between 32 and 160)
);

create unique index if not exists guest_sessions_token_hash_uidx
  on public.guest_sessions(guest_token_hash);

create index if not exists guest_sessions_conversation_idx
  on public.guest_sessions(conversation_id);

create index if not exists conversations_category_status_idx
  on public.conversations(category, status, updated_at desc);

alter table public.guest_sessions enable row level security;
revoke all on public.guest_sessions from anon, authenticated;
grant select on public.guest_sessions to authenticated;

drop policy if exists "owner reads guest sessions" on public.guest_sessions;
create policy "owner reads guest sessions" on public.guest_sessions
for select to authenticated
using (public.is_owner());

create or replace function public.safe_request_ip()
returns text
language plpgsql
stable
as $$
declare
  headers jsonb;
begin
  begin
    headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then
    return null;
  end;
  return left(coalesce(headers->>'x-forwarded-for', headers->>'cf-connecting-ip', headers->>'x-real-ip', ''), 160);
end;
$$;

create or replace function public.normalize_universal_chat_category(value text)
returns text
language sql
immutable
as $$
  select case
    when value in ('project','consultation','question','support') then value
    else 'question'
  end;
$$;

create or replace function public.assert_guest_session(p_guest_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  conversation uuid;
begin
  if p_guest_token_hash is null or char_length(trim(p_guest_token_hash)) < 32 then
    raise exception 'Invalid guest token';
  end if;

  select gs.conversation_id
    into conversation
    from public.guest_sessions gs
   where gs.guest_token_hash = trim(p_guest_token_hash)
     and gs.revoked_at is null
     and gs.expires_at > now()
   limit 1;

  if conversation is null then
    raise exception 'Guest session is expired or unavailable';
  end if;

  update public.guest_sessions
     set last_seen_at = now()
   where guest_token_hash = trim(p_guest_token_hash);

  update public.conversations
     set last_guest_seen_at = now(),
         unread_for_client = 0
   where id = conversation;

  return conversation;
end;
$$;

create or replace function public.normalize_message_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dialog_client_id uuid;
  guest_conversation text := current_setting('w1zzydev.guest_conversation_id', true);
  system_message text := current_setting('w1zzydev.system_message', true);
begin
  select client_id into dialog_client_id
  from public.conversations
  where id = new.conversation_id;

  if dialog_client_id is null then
    raise exception 'Conversation is not linked to a client';
  end if;

  new.body := left(trim(coalesce(new.body, '')), 2000);

  if system_message = 'true' and guest_conversation = new.conversation_id::text then
    new.sender := 'system';
    new.client_id := dialog_client_id;
  elsif guest_conversation = new.conversation_id::text then
    new.sender := 'client';
    new.client_id := dialog_client_id;
  elsif public.is_owner() then
    new.sender := 'owner';
    new.client_id := dialog_client_id;
  else
    new.sender := 'client';
    select c.id into new.client_id
    from public.clients c
    where c.id = dialog_client_id
      and c.auth_user_id = auth.uid();

    if new.client_id is null then
      raise exception 'Client cannot write to this conversation';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.universal_chat_start(
  p_guest_token_hash text,
  p_name text,
  p_contact text,
  p_category text,
  p_message text,
  p_page_url text,
  p_lead_submission_key text default null
)
returns table(conversation_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_name text := left(nullif(trim(coalesce(p_name, '')), ''), 80);
  normalized_contact text := left(nullif(trim(coalesce(p_contact, '')), ''), 160);
  normalized_category text := public.normalize_universal_chat_category(p_category);
  normalized_message text := left(nullif(trim(coalesce(p_message, '')), ''), 2000);
  normalized_page_url text := left(nullif(trim(coalesce(p_page_url, '')), ''), 600);
  normalized_hash text := trim(coalesce(p_guest_token_hash, ''));
  ip text := public.safe_request_ip();
  created_client_id uuid;
  target_conversation_id uuid;
  lead_record public.leads%rowtype;
  session_expiry timestamptz := now() + interval '30 days';
begin
  if normalized_name is null then
    raise exception 'Name is required';
  end if;
  if normalized_message is null then
    raise exception 'Message is required';
  end if;
  if char_length(normalized_hash) < 32 then
    raise exception 'Invalid guest token';
  end if;
  if ip is not null and (
    select count(*) from public.guest_sessions
    where request_ip = ip and created_at > now() - interval '1 hour'
  ) >= 8 then
    raise exception 'Too many chat sessions. Please try again later.';
  end if;

  if p_lead_submission_key is not null then
    select * into lead_record
      from public.leads
     where submission_key = p_lead_submission_key
     limit 1;
  end if;

  if lead_record.id is not null then
    created_client_id := lead_record.client_id;
    target_conversation_id := lead_record.conversation_id;
  end if;

  if created_client_id is null then
    insert into public.clients(name, contact, email, preferred_channel, last_contact_channel)
    values (
      normalized_name,
      normalized_contact,
      case when normalized_contact ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then normalized_contact else null end,
      'site_chat',
      'site_chat'
    )
    returning id into created_client_id;
  end if;

  if target_conversation_id is null then
    insert into public.conversations(client_id, subject, category, status, page_url, unread_for_owner)
    values (
      created_client_id,
      case normalized_category
        when 'project' then 'Заявка / проект'
        when 'consultation' then 'Консультация'
        when 'support' then 'Техподдержка'
        else 'Вопрос с сайта'
      end,
      normalized_category,
      'open',
      normalized_page_url,
      1
    )
    returning id into target_conversation_id;
  else
    update public.conversations
       set category = normalized_category,
           status = coalesce(nullif(status, ''), 'open'),
           page_url = coalesce(page_url, normalized_page_url),
           updated_at = now()
     where id = target_conversation_id;
  end if;

  if lead_record.id is not null then
    update public.leads
       set client_id = coalesce(client_id, created_client_id),
           conversation_id = coalesce(conversation_id, target_conversation_id),
           contact_method = 'site_chat',
           preferred_channel = 'site_chat',
           last_contact_channel = 'site_chat',
           updated_at = now()
     where id = lead_record.id;
  end if;

  insert into public.guest_sessions(conversation_id, guest_token_hash, request_ip, page_url, expires_at)
  values (target_conversation_id, normalized_hash, ip, normalized_page_url, session_expiry)
  on conflict (guest_token_hash) do update
    set conversation_id = excluded.conversation_id,
        revoked_at = null,
        expires_at = excluded.expires_at,
        last_seen_at = now(),
        page_url = excluded.page_url;

  perform set_config('w1zzydev.guest_conversation_id', target_conversation_id::text, true);
  insert into public.messages(conversation_id, client_id, sender, body)
  values (target_conversation_id, created_client_id, 'client', normalized_message);

  return query select target_conversation_id, session_expiry;
end;
$$;

create or replace function public.universal_chat_attach_lead(
  p_guest_token_hash text,
  p_lead_submission_key text,
  p_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  guest_conversation_id uuid := public.assert_guest_session(p_guest_token_hash);
  lead_record public.leads%rowtype;
  message_body text := left(nullif(trim(coalesce(p_message, '')), ''), 1000);
begin
  select * into lead_record
    from public.leads
   where submission_key = p_lead_submission_key
   limit 1;

  if lead_record.id is null then
    raise exception 'Lead was not found';
  end if;

  if lead_record.conversation_id is not null and lead_record.conversation_id <> guest_conversation_id then
    update public.conversations
       set lead_id = null,
           updated_at = now()
     where id = lead_record.conversation_id;
  end if;

  update public.conversations
     set lead_id = lead_record.id,
         category = 'project',
         subject = 'Заявка: ' || lead_record.project_type,
         updated_at = now()
   where id = guest_conversation_id;

  update public.leads
     set conversation_id = guest_conversation_id,
         client_id = coalesce(client_id, (select client_id from public.conversations where id = guest_conversation_id)),
         contact_method = 'site_chat',
         preferred_channel = 'site_chat',
         last_contact_channel = 'site_chat',
         updated_at = now()
   where id = lead_record.id;

  if message_body is not null then
    perform set_config('w1zzydev.guest_conversation_id', guest_conversation_id::text, true);
    perform set_config('w1zzydev.system_message', 'true', true);
    insert into public.messages(conversation_id, sender, body)
    values (guest_conversation_id, 'system', message_body);
  end if;
end;
$$;

create or replace function public.universal_chat_messages(p_guest_token_hash text)
returns table(id uuid, sender text, body text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  conversation uuid := public.assert_guest_session(p_guest_token_hash);
begin
  return query
    select m.id, m.sender, m.body, m.created_at
      from public.messages m
     where m.conversation_id = conversation
     order by m.created_at asc;
end;
$$;

create or replace function public.universal_chat_send(
  p_guest_token_hash text,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  conversation uuid := public.assert_guest_session(p_guest_token_hash);
  normalized_body text := left(nullif(trim(coalesce(p_body, '')), ''), 2000);
  target_client_id uuid;
begin
  if normalized_body is null then
    raise exception 'Message is required';
  end if;

  if (
    select count(*) from public.messages
    where conversation_id = conversation
      and sender = 'client'
      and created_at > now() - interval '1 minute'
  ) >= 8 then
    raise exception 'Too many messages. Please try again later.';
  end if;

  select client_id into target_client_id
    from public.conversations
   where id = conversation;

  perform set_config('w1zzydev.guest_conversation_id', conversation::text, true);
  insert into public.messages(conversation_id, client_id, sender, body)
  values (conversation, target_client_id, 'client', normalized_body);
end;
$$;

revoke all on function public.safe_request_ip() from public;
revoke all on function public.normalize_universal_chat_category(text) from public;
revoke all on function public.assert_guest_session(text) from public;
revoke all on function public.universal_chat_start(text,text,text,text,text,text,text) from public;
revoke all on function public.universal_chat_attach_lead(text,text,text) from public;
revoke all on function public.universal_chat_messages(text) from public;
revoke all on function public.universal_chat_send(text,text) from public;

grant execute on function public.universal_chat_start(text,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.universal_chat_attach_lead(text,text,text) to anon, authenticated;
grant execute on function public.universal_chat_messages(text) to anon, authenticated;
grant execute on function public.universal_chat_send(text,text) to anon, authenticated;
