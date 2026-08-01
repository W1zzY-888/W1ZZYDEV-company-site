-- W1ZZYDEV AI assistant + Telegram notification delta.
-- Run after supabase/fix-owner-message-send.sql.
-- Idempotent: adds processing metadata and replaces service-only RPC helpers.

create extension if not exists pgcrypto;

alter table if exists public.messages
  add column if not exists reply_to_message_id uuid references public.messages(id) on delete set null;

alter table if exists public.assistant_runs
  add column if not exists source_message_id uuid references public.messages(id) on delete set null;

alter table if exists public.assistant_runs
  add column if not exists request_hash text;

alter table if exists public.assistant_runs
  add column if not exists locked_at timestamptz;

alter table if exists public.assistant_runs
  add column if not exists attempt_count integer not null default 0;

alter table if exists public.assistant_runs
  add column if not exists skipped_reason text;

create unique index if not exists messages_one_assistant_reply_per_source_uidx
  on public.messages(conversation_id, reply_to_message_id)
  where sender = 'assistant' and reply_to_message_id is not null;

create unique index if not exists assistant_runs_source_message_uidx
  on public.assistant_runs(conversation_id, source_message_id)
  where source_message_id is not null;

create table if not exists public.chat_notifications (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  channel text not null,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  last_error text,
  locked_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_notifications_channel_check check (channel in ('telegram_owner')),
  constraint chat_notifications_status_check check (status in ('pending','processing','sent','failed','skipped'))
);

alter table if exists public.chat_notifications
  drop constraint if exists chat_notifications_channel_check;

alter table if exists public.chat_notifications
  add constraint chat_notifications_channel_check
  check (channel in ('telegram_owner','telegram_reminder_10','telegram_reminder_30'));

create unique index if not exists chat_notifications_message_channel_uidx
  on public.chat_notifications(message_id, channel);

create index if not exists chat_notifications_status_idx
  on public.chat_notifications(status, updated_at desc);

alter table public.chat_notifications enable row level security;

drop policy if exists "owner reads chat notifications" on public.chat_notifications;
create policy "owner reads chat notifications"
  on public.chat_notifications for select
  using (public.is_owner());

drop policy if exists "no direct public chat notification writes" on public.chat_notifications;
create policy "no direct public chat notification writes"
  on public.chat_notifications for all
  using (false)
  with check (false);

revoke all on public.chat_notifications from anon, authenticated;
grant select on public.chat_notifications to authenticated;

create or replace function public.chat_edge_message_context(
  p_conversation_id uuid,
  p_source_message_id uuid default null,
  p_source_client_message_id text default null
)
returns table (
  message_id uuid,
  conversation_id uuid,
  source_client_message_id text,
  sender text,
  body text,
  created_at timestamptz,
  conversation_status text,
  archived_at timestamptz,
  deleted_at timestamptz,
  assistant_mode text,
  needs_human boolean,
  owner_joined_at timestamptz,
  category text,
  subject text,
  page_url text,
  client_name text,
  client_contact text
)
language sql
security definer
set search_path = public
as $$
  select
    m.id as message_id,
    m.conversation_id,
    m.client_message_id as source_client_message_id,
    m.sender,
    m.body,
    m.created_at,
    c.status as conversation_status,
    c.archived_at,
    c.deleted_at,
    c.assistant_mode,
    c.needs_human,
    c.owner_joined_at,
    c.category,
    c.subject,
    c.page_url,
    cl.name as client_name,
    coalesce(cl.contact, cl.email) as client_contact
  from public.messages as m
  join public.conversations as c on c.id = m.conversation_id
  left join public.clients as cl on cl.id = c.client_id
  where m.conversation_id = p_conversation_id
    and m.sender = 'client'
    and (
      (p_source_message_id is not null and m.id = p_source_message_id)
      or (
        p_source_message_id is null
        and p_source_client_message_id is not null
        and m.client_message_id = p_source_client_message_id
      )
    )
  limit 1;
$$;

create or replace function public.chat_edge_recent_context(
  p_conversation_id uuid,
  p_limit integer default 12
)
returns table (
  sender text,
  body text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select m.sender, left(m.body, 700) as body, m.created_at
  from public.messages as m
  where m.conversation_id = p_conversation_id
    and m.sender in ('client','owner','assistant','system')
  order by m.created_at desc, m.id desc
  limit greatest(1, least(coalesce(p_limit, 12), 20));
$$;

create or replace function public.chat_edge_reserve_ai_run(
  p_conversation_id uuid,
  p_source_message_id uuid,
  p_source_client_message_id text,
  p_request_hash text default null
)
returns table (
  run_id uuid,
  should_process boolean,
  status text,
  assistant_message_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
  v_status text;
  v_assistant_message_id uuid;
  v_attempt_count integer;
begin
  insert into public.assistant_runs as ar (
    conversation_id,
    source_message_id,
    source_client_message_id,
    request_hash,
    status,
    mode,
    locked_at,
    attempt_count
  )
  values (
    p_conversation_id,
    p_source_message_id,
    p_source_client_message_id,
    p_request_hash,
    'started',
    'auto',
    now(),
    1
  )
  on conflict (conversation_id, source_message_id) where source_message_id is not null
  do nothing
  returning ar.id, ar.status, ar.assistant_message_id, ar.attempt_count
  into v_run_id, v_status, v_assistant_message_id, v_attempt_count;

  if v_run_id is not null then
    return query select v_run_id, true, v_status, v_assistant_message_id;
    return;
  end if;

  select ar.id, ar.status, ar.assistant_message_id, ar.attempt_count
    into v_run_id, v_status, v_assistant_message_id, v_attempt_count
  from public.assistant_runs as ar
  where ar.conversation_id = p_conversation_id
    and ar.source_message_id = p_source_message_id
  limit 1;

  if v_status in ('completed','needs_human','skipped') then
    return query select v_run_id, false, v_status, v_assistant_message_id;
    return;
  end if;

  if (
    v_status = 'failed'
    or (
      v_status = 'started'
      and exists (
        select 1
        from public.assistant_runs as ar
        where ar.id = v_run_id
          and coalesce(ar.locked_at, ar.created_at) < now() - interval '2 minutes'
      )
    )
  ) and coalesce(v_attempt_count, 0) < 3 then
    update public.assistant_runs as ar
      set status = 'started',
          request_hash = coalesce(p_request_hash, ar.request_hash),
          locked_at = now(),
          attempt_count = coalesce(ar.attempt_count, 0) + 1,
          error = null
      where ar.id = v_run_id
      returning ar.id, ar.status, ar.assistant_message_id
      into v_run_id, v_status, v_assistant_message_id;
    return query select v_run_id, true, v_status, v_assistant_message_id;
    return;
  end if;

  return query select v_run_id, false, coalesce(v_status, 'unknown'), v_assistant_message_id;
end;
$$;

drop function if exists public.chat_edge_save_assistant_response(uuid,text,text,boolean,text);
drop function if exists public.chat_edge_save_assistant_response(uuid,text,text,boolean,text,uuid,uuid);

create function public.chat_edge_save_assistant_response(
  p_conversation_id uuid,
  p_source_client_message_id text,
  p_body text,
  p_needs_human boolean default false,
  p_error text default null,
  p_source_message_id uuid default null,
  p_run_id uuid default null
)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid := p_run_id;
  v_message_id uuid;
  v_client_message_id text := 'assistant-' || coalesce(p_source_client_message_id, p_source_message_id::text, gen_random_uuid()::text);
  v_clean_body text := left(trim(coalesce(p_body, '')), 2000);
begin
  if public.chat_conversation_is_locked(p_conversation_id) then
    raise exception 'Conversation is closed or archived';
  end if;

  if v_clean_body = '' then
    raise exception 'Assistant response body is required';
  end if;

  if v_run_id is null and p_source_message_id is not null then
    select ar.id into v_run_id
    from public.assistant_runs as ar
    where ar.conversation_id = p_conversation_id
      and ar.source_message_id = p_source_message_id
    limit 1;
  end if;

  if v_run_id is null then
    insert into public.assistant_runs as ar (conversation_id, source_message_id, source_client_message_id, status, mode, attempt_count)
    values (p_conversation_id, p_source_message_id, p_source_client_message_id, case when p_needs_human then 'needs_human' else 'started' end, 'auto', 1)
    on conflict (conversation_id, source_message_id) where source_message_id is not null
    do update set status = excluded.status
    returning ar.id into v_run_id;
  end if;

  select m.id into v_message_id
  from public.messages as m
  where m.conversation_id = p_conversation_id
    and (
      m.client_message_id = v_client_message_id
      or (p_source_message_id is not null and m.sender = 'assistant' and m.reply_to_message_id = p_source_message_id)
    )
  limit 1;

  perform set_config('w1zzydev.guest_conversation_id', p_conversation_id::text, true);
  perform set_config('w1zzydev.sender_override', 'assistant', true);

  if v_message_id is null then
    insert into public.messages as m (
      conversation_id,
      body,
      client_message_id,
      source_client_message_id,
      assistant_run_id,
      reply_to_message_id
    )
    values (
      p_conversation_id,
      v_clean_body,
      v_client_message_id,
      p_source_client_message_id,
      v_run_id,
      p_source_message_id
    )
    returning m.id into v_message_id;
  else
    update public.messages as m
      set body = v_clean_body,
          source_client_message_id = p_source_client_message_id,
          assistant_run_id = v_run_id,
          reply_to_message_id = coalesce(p_source_message_id, m.reply_to_message_id)
      where m.id = v_message_id;
  end if;

  perform set_config('w1zzydev.sender_override', '', true);
  perform set_config('w1zzydev.guest_conversation_id', '', true);

  update public.assistant_runs as ar
    set assistant_message_id = v_message_id,
        status = case when p_needs_human then 'needs_human' else 'completed' end,
        error = left(coalesce(p_error, ''), 500),
        completed_at = now()
    where ar.id = v_run_id;

  update public.conversations as c
    set needs_human = p_needs_human,
        priority = case when p_needs_human then 'high' else c.priority end,
        status = case when p_needs_human then 'waiting_owner' else c.status end,
        assistant_processed_at = now(),
        assistant_error = left(coalesce(p_error, ''), 500),
        updated_at = now()
    where c.id = p_conversation_id;

  return query
    select r.id, r.conversation_id, r.sender, r.body, r.created_at, r.client_message_id
    from public.w1zzydev_chat_message_row(v_message_id) as r;
end;
$$;

create or replace function public.chat_edge_finish_ai_run(
  p_run_id uuid,
  p_status text,
  p_error text default null,
  p_skipped_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('started','completed','skipped','failed','needs_human') then
    raise exception 'Invalid assistant run status';
  end if;

  update public.assistant_runs as ar
    set status = p_status,
        error = left(coalesce(p_error, ''), 500),
        skipped_reason = left(coalesce(p_skipped_reason, ''), 300),
        completed_at = case when p_status in ('completed','skipped','failed','needs_human') then now() else ar.completed_at end
    where ar.id = p_run_id;
end;
$$;

create or replace function public.chat_edge_reserve_notification(
  p_message_id uuid,
  p_channel text default 'telegram_owner'
)
returns table (
  notification_id uuid,
  should_send boolean,
  status text,
  attempt_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
  v_status text;
  v_attempt_count integer;
  v_conversation_id uuid;
begin
  if p_channel not in ('telegram_owner','telegram_reminder_10','telegram_reminder_30') then
    raise exception 'Unsupported notification channel';
  end if;

  select m.conversation_id into v_conversation_id
  from public.messages as m
  where m.id = p_message_id
    and m.sender = 'client';

  if v_conversation_id is null then
    return query select null::uuid, false, 'skipped'::text, 0;
    return;
  end if;

  insert into public.chat_notifications as cn (message_id, conversation_id, channel, status, attempt_count, locked_at)
  values (p_message_id, v_conversation_id, p_channel, 'processing', 1, now())
  on conflict (message_id, channel) do nothing
  returning cn.id, cn.status, cn.attempt_count
  into v_notification_id, v_status, v_attempt_count;

  if v_notification_id is not null then
    return query select v_notification_id, true, v_status, v_attempt_count;
    return;
  end if;

  select cn.id, cn.status, cn.attempt_count
    into v_notification_id, v_status, v_attempt_count
  from public.chat_notifications as cn
  where cn.message_id = p_message_id
    and cn.channel = p_channel
  limit 1;

  if v_status = 'sent' then
    return query select v_notification_id, false, v_status, coalesce(v_attempt_count, 0);
    return;
  end if;

  if (
    v_status in ('failed','pending','skipped')
    or (
      v_status = 'processing'
      and exists (
        select 1
        from public.chat_notifications as cn
        where cn.id = v_notification_id
          and coalesce(cn.locked_at, cn.created_at) < now() - interval '2 minutes'
      )
    )
  ) and coalesce(v_attempt_count, 0) < 3 then
    update public.chat_notifications as cn
      set status = 'processing',
          attempt_count = coalesce(cn.attempt_count, 0) + 1,
          locked_at = now(),
          updated_at = now(),
          last_error = null
      where cn.id = v_notification_id
      returning cn.id, cn.status, cn.attempt_count
      into v_notification_id, v_status, v_attempt_count;
    return query select v_notification_id, true, v_status, v_attempt_count;
    return;
  end if;

  return query select v_notification_id, false, coalesce(v_status, 'unknown'), coalesce(v_attempt_count, 0);
end;
$$;

create or replace function public.chat_edge_due_reminders(
  p_now timestamptz default now()
)
returns table (
  message_id uuid,
  conversation_id uuid,
  source_client_message_id text,
  sender text,
  body text,
  created_at timestamptz,
  conversation_status text,
  archived_at timestamptz,
  deleted_at timestamptz,
  assistant_mode text,
  needs_human boolean,
  owner_joined_at timestamptz,
  category text,
  subject text,
  page_url text,
  client_name text,
  client_contact text,
  reminder_channel text,
  reminder_minutes integer
)
language sql
security definer
set search_path = public
as $$
  with latest_client as (
    select distinct on (m.conversation_id)
      m.id as message_id,
      m.conversation_id,
      m.client_message_id as source_client_message_id,
      m.sender,
      m.body,
      m.created_at
    from public.messages as m
    where m.sender = 'client'
    order by m.conversation_id, m.created_at desc, m.id desc
  ),
  candidates as (
    select
      lc.message_id,
      lc.conversation_id,
      lc.source_client_message_id,
      lc.sender,
      lc.body,
      lc.created_at,
      c.status as conversation_status,
      c.archived_at,
      c.deleted_at,
      c.assistant_mode,
      c.needs_human,
      c.owner_joined_at,
      c.category,
      c.subject,
      c.page_url,
      cl.name as client_name,
      coalesce(cl.contact, cl.email) as client_contact,
      case
        when lc.created_at <= p_now - interval '30 minutes' then 'telegram_reminder_30'
        when lc.created_at <= p_now - interval '10 minutes' then 'telegram_reminder_10'
        else null
      end as reminder_channel,
      case
        when lc.created_at <= p_now - interval '30 minutes' then 30
        when lc.created_at <= p_now - interval '10 minutes' then 10
        else null
      end as reminder_minutes
    from latest_client as lc
    join public.conversations as c on c.id = lc.conversation_id
    left join public.clients as cl on cl.id = c.client_id
    where c.status = 'waiting_owner'
      and c.archived_at is null
      and c.deleted_at is null
      and not exists (
        select 1
        from public.messages as om
        where om.conversation_id = lc.conversation_id
          and om.sender = 'owner'
          and (
            om.created_at > lc.created_at
            or (om.created_at = lc.created_at and om.id > lc.message_id)
          )
      )
  )
  select
    cand.message_id,
    cand.conversation_id,
    cand.source_client_message_id,
    cand.sender,
    cand.body,
    cand.created_at,
    cand.conversation_status,
    cand.archived_at,
    cand.deleted_at,
    cand.assistant_mode,
    cand.needs_human,
    cand.owner_joined_at,
    cand.category,
    cand.subject,
    cand.page_url,
    cand.client_name,
    cand.client_contact,
    cand.reminder_channel,
    cand.reminder_minutes
  from candidates as cand
  where cand.reminder_channel is not null
    and not exists (
      select 1
      from public.chat_notifications as cn
      where cn.message_id = cand.message_id
        and cn.channel = cand.reminder_channel
        and cn.status = 'sent'
    )
  order by cand.created_at asc, cand.message_id asc
  limit 25;
$$;

create or replace function public.chat_edge_finish_notification(
  p_notification_id uuid,
  p_status text,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('pending','processing','sent','failed','skipped') then
    raise exception 'Invalid notification status';
  end if;

  update public.chat_notifications as cn
    set status = p_status,
        last_error = left(coalesce(p_error, ''), 300),
        sent_at = case when p_status = 'sent' then now() else cn.sent_at end,
        updated_at = now()
    where cn.id = p_notification_id;
end;
$$;

create or replace function public.chat_owner_take_dialog(p_conversation_id uuid)
returns setof public.conversations
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;

  return query
    update public.conversations as c
      set assistant_mode = 'suggest',
          needs_human = false,
          owner_joined_at = coalesce(c.owner_joined_at, now()),
          status = case when c.status = 'closed' then c.status else 'in_progress' end,
          updated_at = now()
      where c.id = p_conversation_id
        and c.deleted_at is null
      returning c.*;
end;
$$;

revoke execute on function public.chat_edge_message_context(uuid,uuid,text) from public, anon, authenticated;
revoke execute on function public.chat_edge_recent_context(uuid,integer) from public, anon, authenticated;
revoke execute on function public.chat_edge_reserve_ai_run(uuid,uuid,text,text) from public, anon, authenticated;
revoke execute on function public.chat_edge_save_assistant_response(uuid,text,text,boolean,text,uuid,uuid) from public, anon, authenticated;
revoke execute on function public.chat_edge_finish_ai_run(uuid,text,text,text) from public, anon, authenticated;
revoke execute on function public.chat_edge_reserve_notification(uuid,text) from public, anon, authenticated;
revoke execute on function public.chat_edge_due_reminders(timestamptz) from public, anon, authenticated;
revoke execute on function public.chat_edge_finish_notification(uuid,text,text) from public, anon, authenticated;

grant execute on function public.chat_edge_message_context(uuid,uuid,text) to service_role;
grant execute on function public.chat_edge_recent_context(uuid,integer) to service_role;
grant execute on function public.chat_edge_reserve_ai_run(uuid,uuid,text,text) to service_role;
grant execute on function public.chat_edge_save_assistant_response(uuid,text,text,boolean,text,uuid,uuid) to service_role;
grant execute on function public.chat_edge_finish_ai_run(uuid,text,text,text) to service_role;
grant execute on function public.chat_edge_reserve_notification(uuid,text) to service_role;
grant execute on function public.chat_edge_due_reminders(timestamptz) to service_role;
grant execute on function public.chat_edge_finish_notification(uuid,text,text) to service_role;

grant execute on function public.chat_owner_take_dialog(uuid) to authenticated;

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc as p
join pg_namespace as n on n.oid = p.pronamespace
where n.nspname = 'public'
and p.proname in (
  'chat_edge_message_context',
  'chat_edge_recent_context',
  'chat_edge_reserve_ai_run',
  'chat_edge_save_assistant_response',
  'chat_edge_finish_ai_run',
  'chat_edge_reserve_notification',
  'chat_edge_due_reminders',
  'chat_edge_finish_notification',
  'chat_owner_take_dialog'
)
order by p.proname;
