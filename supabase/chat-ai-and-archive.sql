-- W1ZZYDEV chat archive + AI assistant delta.
-- Run after supabase/complete-chat-system.sql.
-- Idempotent: does not delete existing data when executed.

create extension if not exists pgcrypto;

alter table if exists public.conversations add column if not exists archived_at timestamptz;
alter table if exists public.conversations add column if not exists archived_by text;
alter table if exists public.conversations add column if not exists deleted_at timestamptz;
alter table if exists public.conversations add column if not exists deleted_by text;
alter table if exists public.conversations add column if not exists assistant_mode text not null default 'auto';
alter table if exists public.conversations add column if not exists needs_human boolean not null default false;
alter table if exists public.conversations add column if not exists assistant_processed_at timestamptz;
alter table if exists public.conversations add column if not exists assistant_error text;

alter table if exists public.messages add column if not exists source_client_message_id text;
alter table if exists public.messages add column if not exists assistant_run_id uuid;

alter table if exists public.conversations drop constraint if exists conversations_archive_delete_actor_check;
alter table if exists public.conversations add constraint conversations_archive_delete_actor_check
  check (
    (archived_by is null or archived_by in ('owner','system'))
    and (deleted_by is null or deleted_by in ('owner','system'))
  );

alter table if exists public.conversations drop constraint if exists conversations_assistant_mode_check;
alter table if exists public.conversations add constraint conversations_assistant_mode_check
  check (assistant_mode in ('auto','suggest','disabled'));

create table if not exists public.assistant_settings (
  id boolean primary key default true,
  enabled boolean not null default true,
  default_mode text not null default 'auto',
  locale text not null default 'ru',
  tone text not null default 'professional',
  max_answer_chars integer not null default 900,
  business_hours text,
  services text,
  pricing_rules text,
  timeline_rules text,
  handoff_message text not null default 'Передаю вопрос специалисту W1ZZYDEV. Он продолжит общение в этом диалоге.',
  updated_at timestamptz not null default now(),
  constraint assistant_settings_singleton check (id is true),
  constraint assistant_settings_default_mode_check check (default_mode in ('auto','suggest','disabled'))
);

insert into public.assistant_settings(id)
values (true)
on conflict (id) do nothing;

create table if not exists public.assistant_knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists assistant_knowledge_category_title_uidx
  on public.assistant_knowledge(category, title);

insert into public.assistant_knowledge(title, content, category)
values
  ('Услуги W1ZZYDEV', 'W1ZZYDEV помогает с разработкой сайтов, веб-приложений, мобильных приложений, UI/UX и digital-дизайном, автоматизацией, интеграциями и развитием проектов после запуска.', 'услуги'),
  ('Процесс работы', 'Обычно работа проходит через обсуждение задачи, оценку, структуру или прототип, дизайн, разработку, тестирование, запуск и дальнейшую поддержку.', 'процесс'),
  ('Стоимость', 'Точная стоимость зависит от типа продукта, объёма функций, дизайна, интеграций и сроков. Для оценки нужно краткое описание задачи, цели, желаемые функции и материалы.', 'стоимость'),
  ('Сроки', 'Срок зависит от сложности, готовности контента, дизайна и интеграций. Небольшие задачи оцениваются быстрее, сложные продукты лучше разбивать на этапы.', 'сроки'),
  ('Поддержка', 'W1ZZYDEV может сопровождать проект после запуска: исправлять ошибки, добавлять функции, обновлять контент и следить за стабильностью.', 'поддержка'),
  ('Контакты', 'Продолжить общение можно в чате на сайте, Telegram, WhatsApp, Instagram или по email.', 'контакты'),
  ('Гарантии', 'W1ZZYDEV не обещает точные сроки и цену без оценки задачи. Финальные условия согласуются со специалистом до старта работ.', 'гарантии'),
  ('Частые вопросы', 'Ассистент может помочь собрать требования, объяснить этапы работы и передать сложный вопрос специалисту W1ZZYDEV.', 'частые вопросы')
on conflict do nothing;

create table if not exists public.assistant_runs (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  source_message_id uuid references public.messages(id) on delete set null,
  source_client_message_id text,
  assistant_message_id uuid references public.messages(id) on delete set null,
  status text not null default 'started',
  mode text not null default 'auto',
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint assistant_runs_status_check check (status in ('started','completed','skipped','failed','needs_human')),
  constraint assistant_runs_mode_check check (mode in ('auto','suggest','disabled'))
);

create unique index if not exists assistant_runs_conversation_client_message_uidx
  on public.assistant_runs(conversation_id, source_client_message_id)
  where source_client_message_id is not null;

create index if not exists conversations_archive_status_idx on public.conversations(status, archived_at, deleted_at, updated_at desc);
create index if not exists conversations_assistant_idx on public.conversations(assistant_mode, needs_human, priority);
create index if not exists messages_source_client_message_idx on public.messages(conversation_id, source_client_message_id);
create index if not exists assistant_knowledge_enabled_idx on public.assistant_knowledge(enabled, category);

alter table public.assistant_settings enable row level security;
alter table public.assistant_knowledge enable row level security;
alter table public.assistant_runs enable row level security;

drop policy if exists "owner manages assistant settings" on public.assistant_settings;
create policy "owner manages assistant settings"
  on public.assistant_settings for all
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "owner manages assistant knowledge" on public.assistant_knowledge;
create policy "owner manages assistant knowledge"
  on public.assistant_knowledge for all
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "owner reads assistant runs" on public.assistant_runs;
create policy "owner reads assistant runs"
  on public.assistant_runs for select
  using (public.is_owner());

drop policy if exists "no direct public assistant run writes" on public.assistant_runs;
create policy "no direct public assistant run writes"
  on public.assistant_runs for all
  using (false)
  with check (false);

revoke all on public.assistant_settings, public.assistant_knowledge, public.assistant_runs from anon, authenticated;
grant select, insert, update, delete on public.assistant_settings, public.assistant_knowledge to authenticated;
grant select on public.assistant_runs to authenticated;

create or replace function public.chat_conversation_is_locked(p_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = p_conversation_id
      and (c.status = 'closed' or c.archived_at is not null or c.deleted_at is not null)
  );
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
  if public.chat_conversation_is_locked(v_conversation_id) then
    raise exception 'Conversation is closed or archived';
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
  if public.chat_conversation_is_locked(p_conversation_id) then
    raise exception 'Conversation is closed or archived';
  end if;
  insert into public.messages(conversation_id, body, client_message_id)
  values (p_conversation_id, p_body, p_client_message_id)
  on conflict (conversation_id, client_message_id) where client_message_id is not null
  do update set body = excluded.body
  returning messages.id into v_message_id;
  update public.conversations
    set assistant_mode = 'suggest',
        needs_human = false,
        updated_at = now()
    where id = p_conversation_id;
  return query select * from public.w1zzydev_chat_message_row(v_message_id);
end;
$$;

create or replace function public.chat_guest_assistant_action(
  p_guest_token_hash text,
  p_action text,
  p_question text,
  p_question_client_message_id text,
  p_response_client_message_id text
)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_question_id uuid;
  v_response_id uuid;
  v_response text;
begin
  if public.chat_conversation_is_locked(v_conversation_id) then
    raise exception 'Conversation is closed or archived';
  end if;

  v_response := case p_action
    when 'pricing' then 'Стоимость зависит от типа продукта, объёма функций, дизайна и интеграций. Опишите задачу — специалист подготовит индивидуальную оценку и этапы работы.'
    when 'timeline' then 'Срок зависит от сложности. Небольшой сайт может занять от нескольких дней, а более сложный продукт оценивается после обсуждения требований.'
    when 'process' then 'Сначала обсуждаем задачу, затем формируем структуру и оценку, создаём дизайн, разрабатываем, тестируем и запускаем проект.'
    when 'support' then 'W1ZZYDEV может сопровождать проект после запуска: исправлять ошибки, добавлять функции, обновлять контент и следить за стабильностью.'
    when 'specialist' then 'Передаю вопрос специалисту W1ZZYDEV. Он продолжит общение в этом диалоге.'
    else 'Уточните вопрос, и специалист W1ZZYDEV продолжит общение в этом диалоге.'
  end;

  perform set_config('w1zzydev.guest_conversation_id', v_conversation_id::text, true);
  insert into public.messages(conversation_id, body, client_message_id)
  values (v_conversation_id, p_question, p_question_client_message_id)
  on conflict (conversation_id, client_message_id) where client_message_id is not null
  do update set body = excluded.body
  returning messages.id into v_question_id;

  perform set_config('w1zzydev.sender_override', 'assistant', true);
  insert into public.messages(conversation_id, body, client_message_id, source_client_message_id)
  values (v_conversation_id, v_response, p_response_client_message_id, p_question_client_message_id)
  on conflict (conversation_id, client_message_id) where client_message_id is not null
  do update set body = excluded.body
  returning messages.id into v_response_id;

  perform set_config('w1zzydev.sender_override', '', true);
  perform set_config('w1zzydev.guest_conversation_id', '', true);

  if p_action = 'specialist' then
    update public.conversations
      set priority = 'high',
          status = 'waiting_owner',
          needs_human = true,
          assistant_mode = 'suggest',
          updated_at = now()
      where id = v_conversation_id;
  end if;

  return query select * from public.w1zzydev_chat_message_row(v_question_id);
  return query select * from public.w1zzydev_chat_message_row(v_response_id);
end;
$$;

drop function if exists public.chat_guest_close(text,text);
create function public.chat_guest_close(p_guest_token_hash text, p_client_message_id text)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text, conversation_status text, closed_at timestamptz, rating_submitted boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_message_id uuid;
  v_existing_message_id uuid;
  v_closed_at timestamptz;
begin
  if exists (select 1 from public.conversations where id = v_conversation_id and deleted_at is not null) then
    raise exception 'Conversation was deleted';
  end if;
  if exists (select 1 from public.conversations where id = v_conversation_id and archived_at is not null) then
    raise exception 'Conversation is archived';
  end if;

  select c.closed_at into v_closed_at
  from public.conversations c
  where c.id = v_conversation_id and c.status = 'closed';

  if v_closed_at is null then
    update public.conversations
      set status = 'closed',
          closed_at = now(),
          closed_by = 'client',
          needs_human = false,
          updated_at = now()
      where id = v_conversation_id
      returning closed_at into v_closed_at;
    v_message_id := public.chat_add_system_message(v_conversation_id, 'system', 'Диалог завершён клиентом', p_client_message_id);
  else
    select m.id into v_existing_message_id
    from public.messages m
    where m.conversation_id = v_conversation_id
      and m.sender = 'system'
      and m.body in ('Диалог завершён клиентом','Диалог завершён')
    order by m.created_at desc
    limit 1;
    v_message_id := v_existing_message_id;
  end if;

  if v_message_id is null then
    return;
  end if;

  return query
    select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id,
           c.status as conversation_status,
           c.closed_at,
           exists (
             select 1 from public.conversation_ratings r
             where r.conversation_id = c.id and r.closed_at_snapshot = c.closed_at
           ) as rating_submitted
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = v_message_id;
end;
$$;

create or replace function public.chat_owner_archive(p_conversation_id uuid)
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
  update public.conversations
    set archived_at = now(),
        archived_by = 'owner',
        updated_at = now()
    where id = p_conversation_id and deleted_at is null
    returning *;
end;
$$;

create or replace function public.chat_owner_restore(p_conversation_id uuid)
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
  update public.conversations
    set archived_at = null,
        archived_by = null,
        updated_at = now()
    where id = p_conversation_id and deleted_at is null
    returning *;
end;
$$;

create or replace function public.chat_owner_set_assistant_mode(p_conversation_id uuid, p_mode text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;
  if p_mode not in ('auto','suggest','disabled') then
    raise exception 'Invalid assistant mode';
  end if;
  update public.conversations
    set assistant_mode = p_mode,
        updated_at = now()
    where id = p_conversation_id and deleted_at is null;
end;
$$;

create or replace function public.chat_owner_delete_permanently(p_conversation_id uuid, p_confirmation text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;
  if p_confirmation not in ('УДАЛИТЬ','DELETE') then
    raise exception 'Confirmation required';
  end if;
  if not exists (select 1 from public.conversations where id = p_conversation_id and status = 'closed') then
    raise exception 'Conversation must be closed before permanent deletion';
  end if;

  update public.conversations
    set deleted_at = now(),
        deleted_by = 'owner',
        updated_at = now()
    where id = p_conversation_id;

  insert into public.admin_activity(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'chat.delete_permanently', 'conversation', p_conversation_id, jsonb_build_object('deleted_at', now()));

  delete from public.guest_sessions where conversation_id = p_conversation_id;
  delete from public.conversation_ratings where conversation_id = p_conversation_id;
  delete from public.assistant_runs where conversation_id = p_conversation_id;
  delete from public.messages where conversation_id = p_conversation_id;
  delete from public.conversations where id = p_conversation_id;
end;
$$;

create or replace function public.chat_edge_save_assistant_response(
  p_conversation_id uuid,
  p_source_client_message_id text,
  p_body text,
  p_needs_human boolean default false,
  p_error text default null
)
returns table (id uuid, conversation_id uuid, sender text, body text, created_at timestamptz, client_message_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
  v_message_id uuid;
  v_client_message_id text := 'assistant-' || coalesce(p_source_client_message_id, gen_random_uuid()::text);
begin
  if public.chat_conversation_is_locked(p_conversation_id) then
    raise exception 'Conversation is closed or archived';
  end if;
  if exists (
    select 1 from public.assistant_runs
    where conversation_id = p_conversation_id
      and source_client_message_id = p_source_client_message_id
      and status in ('completed','needs_human')
  ) then
    return;
  end if;

  insert into public.assistant_runs(conversation_id, source_client_message_id, status, mode)
  values (p_conversation_id, p_source_client_message_id, case when p_needs_human then 'needs_human' else 'started' end, 'auto')
  on conflict (conversation_id, source_client_message_id) where source_client_message_id is not null
  do update set status = excluded.status, error = p_error
  returning id into v_run_id;

  perform set_config('w1zzydev.guest_conversation_id', p_conversation_id::text, true);
  perform set_config('w1zzydev.sender_override', 'assistant', true);
  insert into public.messages(conversation_id, body, client_message_id, source_client_message_id, assistant_run_id)
  values (p_conversation_id, p_body, v_client_message_id, p_source_client_message_id, v_run_id)
  on conflict (conversation_id, client_message_id) where client_message_id is not null
  do update set body = excluded.body
  returning messages.id into v_message_id;
  perform set_config('w1zzydev.sender_override', '', true);
  perform set_config('w1zzydev.guest_conversation_id', '', true);

  update public.assistant_runs
    set assistant_message_id = v_message_id,
        status = case when p_needs_human then 'needs_human' else 'completed' end,
        error = p_error,
        completed_at = now()
    where id = v_run_id;

  update public.conversations
    set needs_human = p_needs_human,
        priority = case when p_needs_human then 'high' else priority end,
        status = case when p_needs_human then 'waiting_owner' else status end,
        assistant_processed_at = now(),
        assistant_error = p_error,
        updated_at = now()
    where id = p_conversation_id;

  return query select * from public.w1zzydev_chat_message_row(v_message_id);
end;
$$;

grant execute on function public.chat_guest_send(text,text,text) to anon, authenticated;
grant execute on function public.chat_guest_close(text,text) to anon, authenticated;
grant execute on function public.chat_owner_send(uuid,text,text) to authenticated;
grant execute on function public.chat_guest_assistant_action(text,text,text,text,text) to anon, authenticated;
grant execute on function public.chat_owner_archive(uuid) to authenticated;
grant execute on function public.chat_owner_restore(uuid) to authenticated;
grant execute on function public.chat_owner_set_assistant_mode(uuid,text) to authenticated;
grant execute on function public.chat_owner_delete_permanently(uuid,text) to authenticated;
revoke execute on function public.chat_edge_save_assistant_response(uuid,text,text,boolean,text) from public, anon, authenticated;
grant execute on function public.chat_edge_save_assistant_response(uuid,text,text,boolean,text) to service_role;

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
