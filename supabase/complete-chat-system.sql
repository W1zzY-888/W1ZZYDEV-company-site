-- W1ZZYDEV complete chat system delta.
-- Run after supabase/admin-panel-schema.sql. The script is idempotent and does not delete existing messages.

create extension if not exists pgcrypto;

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

create table if not exists public.guest_sessions (
  token_hash text primary key,
  guest_token_hash text,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.guest_sessions add column if not exists token_hash text;
alter table public.guest_sessions add column if not exists guest_token_hash text;
alter table public.guest_sessions add column if not exists expires_at timestamptz not null default (now() + interval '30 days');
alter table public.guest_sessions add column if not exists created_at timestamptz not null default now();

create unique index if not exists guest_sessions_token_hash_complete_uidx
  on public.guest_sessions(token_hash);

alter table public.guest_sessions enable row level security;

drop policy if exists "no direct public guest session access" on public.guest_sessions;
create policy "no direct public guest session access"
  on public.guest_sessions for all
  using (false)
  with check (false);

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

create table if not exists public.conversation_ratings (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  closed_at_snapshot timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.conversation_ratings enable row level security;

drop policy if exists "owner reads conversation ratings" on public.conversation_ratings;
create policy "owner reads conversation ratings"
  on public.conversation_ratings for select
  using (public.is_owner());

drop policy if exists "no direct public rating writes" on public.conversation_ratings;
create policy "no direct public rating writes"
  on public.conversation_ratings for insert
  with check (false);

create unique index if not exists conversation_ratings_one_per_close_uidx
  on public.conversation_ratings(conversation_id, closed_at_snapshot);

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
  guest_conversation uuid := nullif(current_setting('w1zzydev.guest_conversation_id', true), '')::uuid;
  sender_override text := nullif(current_setting('w1zzydev.sender_override', true), '');
begin
  new.body := left(trim(coalesce(new.body, '')), 2000);
  if new.body = '' then
    raise exception 'Message body is required';
  end if;

  if public.is_owner() and coalesce(sender_override, '') = '' then
    new.sender := 'owner';
  elsif guest_conversation is not null and guest_conversation = new.conversation_id then
    new.sender := coalesce(sender_override, 'client');
    if new.sender not in ('client','system','assistant') then
      raise exception 'Invalid guest sender';
    end if;
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
          updated_at = now()
      where id = new.conversation_id;
  elsif new.sender = 'owner' then
    update public.conversations
      set unread_for_client = coalesce(unread_for_client, 0) + 1,
          unread_for_guest = coalesce(unread_for_guest, 0) + 1,
          status = case when status = 'closed' then status else 'waiting_client' end,
          owner_joined_at = coalesce(owner_joined_at, now()),
          updated_at = now()
      where id = new.conversation_id;
  else
    update public.conversations
      set updated_at = now()
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
    and gs.expires_at > now()
  limit 1;
  if v_conversation_id is null then
    raise exception 'Invalid or expired guest session';
  end if;
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

create or replace function public.chat_guest_start(
  p_guest_token_hash text,
  p_name text,
  p_contact text,
  p_category text,
  p_message text,
  p_page_url text,
  p_lead_submission_key text default null,
  p_client_message_id text default null
)
returns table(conversation_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_conversation_id uuid;
  v_expires_at timestamptz := now() + interval '30 days';
begin
  insert into public.clients(name, contact, preferred_channel, last_contact_channel)
  values (left(trim(coalesce(p_name, 'Клиент')), 120), left(trim(coalesce(p_contact, '')), 200), 'site_chat', 'site_chat')
  returning id into v_client_id;

  insert into public.conversations(client_id, lead_id, subject, category, status, page_url)
  values (
    v_client_id,
    (select id from public.leads where submission_key = p_lead_submission_key limit 1),
    left(trim(coalesce(p_message, 'Обращение W1ZZYDEV')), 120),
    coalesce(nullif(p_category, ''), 'question'),
    'waiting_owner',
    left(coalesce(p_page_url, ''), 500)
  )
  returning id into v_conversation_id;

  insert into public.guest_sessions(token_hash, guest_token_hash, conversation_id, expires_at)
  values (p_guest_token_hash, p_guest_token_hash, v_conversation_id, v_expires_at)
  on conflict (token_hash) do update
    set conversation_id = excluded.conversation_id,
        guest_token_hash = excluded.guest_token_hash,
        expires_at = excluded.expires_at;

  perform set_config('w1zzydev.guest_conversation_id', v_conversation_id::text, true);
  insert into public.messages(conversation_id, body, client_message_id)
  values (v_conversation_id, p_message, p_client_message_id);
  perform set_config('w1zzydev.guest_conversation_id', '', true);

  update public.conversations
    set assistant_started_at = now()
    where id = v_conversation_id;
  perform public.chat_add_system_message(
    v_conversation_id,
    'assistant',
    'Здравствуйте! Я помощник W1ZZYDEV. Ваше сообщение уже передано специалисту. Пока он подключается, могу ответить на частые вопросы.',
    'assistant-start-' || v_conversation_id::text
  );

  return query select v_conversation_id, v_expires_at;
end;
$$;

create or replace function public.chat_guest_messages(
  p_guest_token_hash text,
  p_after_created_at timestamptz default null,
  p_after_id uuid default null
)
returns table (
  id uuid,
  conversation_id uuid,
  sender text,
  body text,
  created_at timestamptz,
  client_message_id text,
  conversation_status text,
  closed_at timestamptz,
  rating_submitted boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
begin
  update public.conversations
    set unread_for_client = 0,
        unread_for_guest = 0
    where conversations.id = v_conversation_id;

  return query
    select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id,
           c.status, c.closed_at,
           exists (
             select 1 from public.conversation_ratings r
             where r.conversation_id = c.id
               and r.closed_at_snapshot = c.closed_at
           ) as rating_submitted
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.conversation_id = v_conversation_id
      and (
        p_after_created_at is null
        or m.created_at > p_after_created_at
        or (m.created_at = p_after_created_at and (p_after_id is null or m.id > p_after_id))
      )
    order by m.created_at asc, m.id asc;
end;
$$;

create or replace function public.chat_guest_send(p_guest_token_hash text, p_body text, p_client_message_id text)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_message_id uuid;
begin
  if exists (select 1 from public.conversations where conversations.id = v_conversation_id and status = 'closed') then
    raise exception 'Conversation is closed';
  end if;
  perform set_config('w1zzydev.guest_conversation_id', v_conversation_id::text, true);
  insert into public.messages(conversation_id, body, client_message_id)
  values (v_conversation_id, p_body, p_client_message_id)
  on conflict (conversation_id, client_message_id) where client_message_id is not null
  do update set body = excluded.body
  returning messages.id into v_message_id;
  perform set_config('w1zzydev.guest_conversation_id', '', true);
  return query select * from public.w1zzydev_chat_message_row(v_message_id);
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
  if exists (select 1 from public.conversations where conversations.id = p_conversation_id and status = 'closed') then
    raise exception 'Conversation is closed';
  end if;
  insert into public.messages(conversation_id, body, client_message_id)
  values (p_conversation_id, p_body, p_client_message_id)
  on conflict (conversation_id, client_message_id) where client_message_id is not null
  do update set body = excluded.body
  returning messages.id into v_message_id;
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
    set unread_for_owner = 0
    where public.is_owner() and id = p_conversation_id;
$$;

create or replace function public.chat_guest_assistant_reply(p_guest_token_hash text, p_action text, p_client_message_id text)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_body text;
  v_message_id uuid;
begin
  v_body := case p_action
    when 'cost' then 'Стоимость зависит от типа продукта, объёма функций и дизайна. Опишите задачу — специалист подготовит индивидуальную оценку и этапы работы.'
    when 'timeline' then 'Срок зависит от сложности. Небольшой сайт может занять от нескольких дней, а более сложный продукт оценивается после обсуждения требований.'
    when 'process' then 'Сначала обсуждаем задачу, затем формируем структуру и оценку, создаём дизайн, разрабатываем, тестируем и запускаем проект.'
    when 'support' then 'W1ZZYDEV может сопровождать проект после запуска: исправлять ошибки, добавлять функции, обновлять контент и следить за стабильностью.'
    else 'Специалист подключится к диалогу в ближайшее время.'
  end;
  if p_action = 'owner' then
    update public.conversations set status = 'waiting_owner', priority = 'high', updated_at = now()
    where id = v_conversation_id;
  end if;
  v_message_id := public.chat_add_system_message(v_conversation_id, 'assistant', v_body, p_client_message_id);
  return query select * from public.w1zzydev_chat_message_row(v_message_id);
end;
$$;

create or replace function public.chat_guest_close(p_guest_token_hash text, p_client_message_id text)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_message_id uuid;
begin
  update public.conversations
    set status = 'closed', closed_at = now(), closed_by = 'client', updated_at = now()
    where id = v_conversation_id;
  v_message_id := public.chat_add_system_message(v_conversation_id, 'system', 'Диалог завершён', p_client_message_id);
  return query select * from public.w1zzydev_chat_message_row(v_message_id);
end;
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
    set status = 'closed', closed_at = now(), closed_by = 'owner', updated_at = now()
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
    set status = 'in_progress', closed_at = null, closed_by = null, updated_at = now()
    where id = p_conversation_id;
  v_message_id := public.chat_add_system_message(p_conversation_id, 'system', 'Диалог снова открыт', p_client_message_id);
  return query select * from public.w1zzydev_chat_message_row(v_message_id);
end;
$$;

create or replace function public.chat_guest_rate(p_guest_token_hash text, p_rating integer, p_comment text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_closed_at timestamptz;
begin
  select closed_at into v_closed_at
  from public.conversations
  where id = v_conversation_id and status = 'closed';
  if v_closed_at is null then
    raise exception 'Conversation must be closed before rating';
  end if;
  insert into public.conversation_ratings(conversation_id, rating, comment, closed_at_snapshot)
  values (v_conversation_id, greatest(1, least(5, p_rating)), left(trim(coalesce(p_comment, '')), 600), v_closed_at)
  on conflict (conversation_id, closed_at_snapshot) do nothing;
end;
$$;

create or replace function public.chat_guest_attach_lead(p_guest_token_hash text, p_lead_submission_key text, p_message text default null, p_client_message_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_lead_id uuid;
begin
  select id into v_lead_id from public.leads where submission_key = p_lead_submission_key limit 1;
  if v_lead_id is not null then
    update public.conversations set lead_id = v_lead_id, category = 'project', status = 'waiting_owner', updated_at = now()
    where id = v_conversation_id;
    update public.leads set conversation_id = v_conversation_id, updated_at = now()
    where id = v_lead_id;
  end if;
  if coalesce(trim(p_message), '') <> '' then
    perform public.chat_add_system_message(v_conversation_id, 'system', p_message, p_client_message_id);
  end if;
end;
$$;

create or replace function public.chat_owner_delete_conversation(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.conversations
  where public.is_owner() and id = p_conversation_id;
$$;

grant execute on function public.chat_guest_start(text,text,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.chat_guest_messages(text,timestamptz,uuid) to anon, authenticated;
grant execute on function public.chat_guest_send(text,text,text) to anon, authenticated;
grant execute on function public.chat_guest_assistant_reply(text,text,text) to anon, authenticated;
grant execute on function public.chat_guest_close(text,text) to anon, authenticated;
grant execute on function public.chat_guest_rate(text,integer,text) to anon, authenticated;
grant execute on function public.chat_guest_attach_lead(text,text,text,text) to anon, authenticated;
grant execute on function public.chat_owner_messages(uuid,timestamptz,uuid) to authenticated;
grant execute on function public.chat_owner_send(uuid,text,text) to authenticated;
grant execute on function public.chat_owner_mark_read(uuid) to authenticated;
grant execute on function public.chat_owner_close(uuid,text) to authenticated;
grant execute on function public.chat_owner_reopen(uuid,text) to authenticated;
grant execute on function public.chat_owner_delete_conversation(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
      alter publication supabase_realtime add table public.messages;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations') then
      alter publication supabase_realtime add table public.conversations;
    end if;
  end if;
end $$;
