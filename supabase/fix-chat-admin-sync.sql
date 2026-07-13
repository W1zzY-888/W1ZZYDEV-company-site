-- W1ZZYDEV chat admin sync repair.
-- Run this after supabase/admin-panel-schema.sql.
-- Idempotent: safe to run more than once. It does not delete messages, conversations, leads, reviews, users, or ratings.

create extension if not exists pgcrypto;

-- Columns used by the current admin messenger UI and chat RPC.
alter table if exists public.clients add column if not exists preferred_channel text;
alter table if exists public.clients add column if not exists last_contact_channel text;
alter table if exists public.leads add column if not exists preferred_channel text;
alter table if exists public.leads add column if not exists last_contact_channel text;
alter table if exists public.leads add column if not exists contact_method text;
alter table if exists public.messages add column if not exists client_message_id text;
alter table if exists public.conversations add column if not exists category text not null default 'question';
alter table if exists public.conversations add column if not exists status text not null default 'new';
alter table if exists public.conversations add column if not exists page_url text;
alter table if exists public.conversations add column if not exists unread_for_guest integer not null default 0;
alter table if exists public.conversations add column if not exists closed_at timestamptz;
alter table if exists public.conversations add column if not exists closed_by text;
alter table if exists public.conversations add column if not exists priority text not null default 'normal';
alter table if exists public.conversations add column if not exists assistant_started_at timestamptz;
alter table if exists public.conversations add column if not exists owner_joined_at timestamptz;
alter table if exists public.conversations add column if not exists last_message_at timestamptz;

alter table if exists public.conversations drop constraint if exists conversations_category_check;
alter table if exists public.conversations add constraint conversations_category_check
  check (category in ('project','consultation','question','support'));

alter table if exists public.conversations drop constraint if exists conversations_status_check;
alter table if exists public.conversations add constraint conversations_status_check
  check (status in ('new','waiting_owner','waiting_client','in_progress','closed','resolved','open'));

alter table if exists public.conversations drop constraint if exists conversations_closed_by_check;
alter table if exists public.conversations add constraint conversations_closed_by_check
  check (closed_by is null or closed_by in ('owner','client'));

alter table if exists public.conversations drop constraint if exists conversations_priority_check;
alter table if exists public.conversations add constraint conversations_priority_check
  check (priority in ('normal','high'));

alter table if exists public.messages drop constraint if exists messages_sender_check;
alter table if exists public.messages add constraint messages_sender_check
  check (sender in ('owner','client','system','assistant'));

create unique index if not exists messages_conversation_client_message_uidx
  on public.messages(conversation_id, client_message_id)
  where client_message_id is not null;

create index if not exists messages_conversation_created_idx
  on public.messages(conversation_id, created_at, id);

create index if not exists conversations_updated_idx
  on public.conversations(updated_at desc);

create table if not exists public.guest_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  guest_token_hash text,
  token_hash text,
  request_ip text,
  page_url text,
  expires_at timestamptz not null default (now() + interval '30 days'),
  revoked_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.guest_sessions add column if not exists guest_token_hash text;
alter table public.guest_sessions add column if not exists token_hash text;
alter table public.guest_sessions add column if not exists expires_at timestamptz not null default (now() + interval '30 days');
alter table public.guest_sessions add column if not exists revoked_at timestamptz;
alter table public.guest_sessions add column if not exists last_seen_at timestamptz not null default now();

create unique index if not exists guest_sessions_guest_token_hash_uidx
  on public.guest_sessions(guest_token_hash)
  where guest_token_hash is not null;

create unique index if not exists guest_sessions_token_hash_uidx
  on public.guest_sessions(token_hash)
  where token_hash is not null;

create table if not exists public.conversation_ratings (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  closed_at_snapshot timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index if not exists conversation_ratings_one_per_close_uidx
  on public.conversation_ratings(conversation_id, closed_at_snapshot);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_ratings enable row level security;
alter table public.guest_sessions enable row level security;

grant select on public.conversations, public.messages, public.conversation_ratings to authenticated;
grant select on public.guest_sessions to authenticated;
grant update(category,status,updated_at,unread_for_owner,unread_for_client,unread_for_guest,closed_at,closed_by,priority,last_message_at)
  on public.conversations to authenticated;
grant insert(conversation_id, body, client_message_id) on public.messages to authenticated;

drop policy if exists "owner reads conversations" on public.conversations;
create policy "owner reads conversations"
  on public.conversations for select
  using (public.is_owner());

drop policy if exists "owner updates conversations" on public.conversations;
create policy "owner updates conversations"
  on public.conversations for update
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "client reads own conversations" on public.conversations;
create policy "client reads own conversations"
  on public.conversations for select
  using (
    exists (
      select 1
      from public.clients c
      where c.id = conversations.client_id
        and c.auth_user_id = auth.uid()
    )
  );

drop policy if exists "owner reads messages" on public.messages;
create policy "owner reads messages"
  on public.messages for select
  using (public.is_owner());

drop policy if exists "owner sends messages" on public.messages;
create policy "owner sends messages"
  on public.messages for insert
  with check (public.is_owner() and sender = 'owner');

drop policy if exists "client reads own messages" on public.messages;
create policy "client reads own messages"
  on public.messages for select
  using (
    exists (
      select 1
      from public.conversations co
      join public.clients c on c.id = co.client_id
      where co.id = messages.conversation_id
        and c.auth_user_id = auth.uid()
    )
  );

drop policy if exists "owner reads conversation ratings" on public.conversation_ratings;
create policy "owner reads conversation ratings"
  on public.conversation_ratings for select
  using (public.is_owner());

drop policy if exists "no direct public rating writes" on public.conversation_ratings;
create policy "no direct public rating writes"
  on public.conversation_ratings for insert
  with check (false);

drop policy if exists "owner reads guest sessions" on public.guest_sessions;
create policy "owner reads guest sessions"
  on public.guest_sessions for select
  using (public.is_owner());

drop policy if exists "no direct public guest session access" on public.guest_sessions;
create policy "no direct public guest session access"
  on public.guest_sessions for all
  using (false)
  with check (false);

create or replace function public.w1zzydev_chat_message_row(p_message_id uuid)
returns table (
  id uuid,
  conversation_id uuid,
  sender text,
  body text,
  created_at timestamptz,
  client_message_id text
)
language sql
security definer
set search_path = public
as $$
  select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id
  from public.messages m
  where m.id = p_message_id;
$$;

create or replace function public.normalize_message_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dialog_client_id uuid;
  guest_conversation uuid := nullif(current_setting('w1zzydev.guest_conversation_id', true), '')::uuid;
  sender_override text := nullif(current_setting('w1zzydev.sender_override', true), '');
begin
  select client_id into dialog_client_id
  from public.conversations
  where id = new.conversation_id;

  new.body := left(trim(coalesce(new.body, '')), 2000);
  if new.body = '' then
    raise exception 'Message body is required';
  end if;

  if public.is_owner() and coalesce(sender_override, '') = '' then
    new.sender := 'owner';
    new.client_id := dialog_client_id;
  elsif guest_conversation is not null and guest_conversation = new.conversation_id then
    new.sender := coalesce(sender_override, 'client');
    if new.sender not in ('client','system','assistant') then
      raise exception 'Invalid guest sender';
    end if;
    new.client_id := dialog_client_id;
  else
    raise exception 'Not allowed to send message';
  end if;

  new.created_at := coalesce(new.created_at, now());
  return new;
end;
$$;

drop trigger if exists normalize_message_before_insert_trigger on public.messages;
create trigger normalize_message_before_insert_trigger
  before insert on public.messages
  for each row execute function public.normalize_message_before_insert();

create or replace function public.update_conversation_after_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sender = 'client' then
    update public.conversations
       set unread_for_owner = coalesce(unread_for_owner, 0) + 1,
           status = case when status = 'closed' then status else 'waiting_owner' end,
           last_message_at = new.created_at,
           updated_at = now()
     where id = new.conversation_id;
  elsif new.sender = 'owner' then
    update public.conversations
       set unread_for_client = coalesce(unread_for_client, 0) + 1,
           unread_for_guest = coalesce(unread_for_guest, 0) + 1,
           status = case when status = 'closed' then status else 'waiting_client' end,
           owner_joined_at = coalesce(owner_joined_at, now()),
           last_message_at = new.created_at,
           updated_at = now()
     where id = new.conversation_id;
  else
    update public.conversations
       set last_message_at = new.created_at,
           updated_at = now()
     where id = new.conversation_id;
  end if;
  return new;
end;
$$;

drop trigger if exists update_conversation_after_message_trigger on public.messages;
create trigger update_conversation_after_message_trigger
  after insert on public.messages
  for each row execute function public.update_conversation_after_message();

create or replace function public.chat_assert_guest(p_guest_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  select gs.conversation_id into v_conversation_id
  from public.guest_sessions gs
  where (gs.token_hash = p_guest_token_hash or gs.guest_token_hash = p_guest_token_hash)
    and coalesce(gs.revoked_at, now() + interval '1 day') > now()
    and gs.expires_at > now()
  limit 1;

  if v_conversation_id is null then
    raise exception 'Invalid or expired guest session';
  end if;

  update public.guest_sessions
     set last_seen_at = now()
   where token_hash = p_guest_token_hash
      or guest_token_hash = p_guest_token_hash;

  return v_conversation_id;
end;
$$;

create or replace function public.chat_add_system_message(p_conversation_id uuid, p_sender text, p_body text, p_client_message_id text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
begin
  perform set_config('w1zzydev.guest_conversation_id', p_conversation_id::text, true);
  perform set_config('w1zzydev.sender_override', p_sender, true);
  insert into public.messages(conversation_id, sender, body, client_message_id)
  values (p_conversation_id, p_sender, p_body, p_client_message_id)
  on conflict (conversation_id, client_message_id) where client_message_id is not null
  do update set body = excluded.body
  returning id into v_message_id;
  perform set_config('w1zzydev.sender_override', '', true);
  perform set_config('w1zzydev.guest_conversation_id', '', true);
  return v_message_id;
end;
$$;

create or replace function public.chat_owner_messages(p_conversation_id uuid, p_after_created_at timestamptz default null, p_after_id uuid default null)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language sql
security definer
set search_path = public
as $$
  select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id
  from public.messages m
  where public.is_owner()
    and m.conversation_id = p_conversation_id
    and (
      p_after_created_at is null
      or m.created_at > p_after_created_at
      or (m.created_at = p_after_created_at and (p_after_id is null or m.id > p_after_id))
    )
  order by m.created_at asc, m.id asc;
$$;

create or replace function public.chat_owner_send(p_conversation_id uuid, p_body text, p_client_message_id text)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
begin
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;
  if exists (select 1 from public.conversations where id = p_conversation_id and status = 'closed') then
    raise exception 'Conversation is closed';
  end if;
  insert into public.messages(conversation_id, body, client_message_id)
  values (p_conversation_id, p_body, p_client_message_id)
  on conflict (conversation_id, client_message_id) where client_message_id is not null
  do update set body = excluded.body
  returning id into v_message_id;
  return query select * from public.w1zzydev_chat_message_row(v_message_id);
end;
$$;

create or replace function public.chat_owner_mark_read(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.conversations
     set unread_for_owner = 0,
         updated_at = now()
   where public.is_owner()
     and id = p_conversation_id;
$$;

create or replace function public.chat_owner_close(p_conversation_id uuid, p_client_message_id text)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
begin
  if not public.is_owner() then raise exception 'Owner only'; end if;
  update public.conversations
     set status = 'closed',
         closed_at = now(),
         closed_by = 'owner',
         updated_at = now()
   where id = p_conversation_id;
  v_message_id := public.chat_add_system_message(p_conversation_id, 'system', 'Диалог завершён', p_client_message_id);
  return query select * from public.w1zzydev_chat_message_row(v_message_id);
end;
$$;

create or replace function public.chat_owner_reopen(p_conversation_id uuid, p_client_message_id text)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
begin
  if not public.is_owner() then raise exception 'Owner only'; end if;
  update public.conversations
     set status = 'in_progress',
         closed_at = null,
         closed_by = null,
         updated_at = now()
   where id = p_conversation_id;
  v_message_id := public.chat_add_system_message(p_conversation_id, 'system', 'Диалог снова открыт', p_client_message_id);
  return query select * from public.w1zzydev_chat_message_row(v_message_id);
end;
$$;

create or replace function public.chat_owner_delete_conversation(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.conversations
   where public.is_owner()
     and id = p_conversation_id;
$$;

grant execute on function public.chat_owner_messages(uuid,timestamptz,uuid) to authenticated;
grant execute on function public.chat_owner_send(uuid,text,text) to authenticated;
grant execute on function public.chat_owner_mark_read(uuid) to authenticated;
grant execute on function public.chat_owner_close(uuid,text) to authenticated;
grant execute on function public.chat_owner_reopen(uuid,text) to authenticated;
grant execute on function public.chat_owner_delete_conversation(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'messages'
    ) then
      alter publication supabase_realtime add table public.messages;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'conversations'
    ) then
      alter publication supabase_realtime add table public.conversations;
    end if;
  end if;
end $$;

-- Diagnostics to run after this file:
--
-- select schemaname, tablename
-- from pg_publication_tables
-- where pubname = 'supabase_realtime'
-- and schemaname = 'public'
-- and tablename in ('messages', 'conversations');
--
-- select schemaname, tablename, policyname, roles, cmd
-- from pg_policies
-- where schemaname = 'public'
-- and tablename in ('messages', 'conversations', 'conversation_ratings');
