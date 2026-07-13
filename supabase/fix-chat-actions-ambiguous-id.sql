-- W1ZZYDEV chat actions ambiguous-id fix.
-- Run after supabase/chat-ai-and-archive.sql.
-- Idempotent: replaces affected RPC functions only, does not delete existing data.

alter table if exists public.conversations drop constraint if exists conversations_archive_delete_actor_check;
alter table if exists public.conversations add constraint conversations_archive_delete_actor_check
  check (
    (archived_by is null or length(archived_by) > 0)
    and (deleted_by is null or length(deleted_by) > 0)
  );

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
  perform set_config('w1zzydev.sender_override', '', true);

  select m.id into v_question_id
  from public.messages as m
  where m.conversation_id = v_conversation_id
    and m.client_message_id = p_question_client_message_id
  limit 1;

  if v_question_id is null then
    insert into public.messages as m (conversation_id, body, client_message_id)
    values (v_conversation_id, p_question, p_question_client_message_id)
    returning m.id into v_question_id;
  else
    update public.messages as m
      set body = p_question
      where m.id = v_question_id;
  end if;

  perform set_config('w1zzydev.sender_override', 'assistant', true);

  select m.id into v_response_id
  from public.messages as m
  where m.conversation_id = v_conversation_id
    and m.client_message_id = p_response_client_message_id
  limit 1;

  if v_response_id is null then
    insert into public.messages as m (conversation_id, body, client_message_id, source_client_message_id)
    values (v_conversation_id, v_response, p_response_client_message_id, p_question_client_message_id)
    returning m.id into v_response_id;
  else
    update public.messages as m
      set body = v_response,
          source_client_message_id = p_question_client_message_id
      where m.id = v_response_id;
  end if;

  perform set_config('w1zzydev.sender_override', '', true);
  perform set_config('w1zzydev.guest_conversation_id', '', true);

  if p_action = 'specialist' then
    update public.conversations as c
      set priority = 'high',
          status = 'waiting_owner',
          needs_human = true,
          assistant_mode = 'suggest',
          updated_at = now()
      where c.id = v_conversation_id;
  end if;

  return query
    select r.id, r.conversation_id, r.sender, r.body, r.created_at, r.client_message_id
    from public.w1zzydev_chat_message_row(v_question_id) as r;

  return query
    select r.id, r.conversation_id, r.sender, r.body, r.created_at, r.client_message_id
    from public.w1zzydev_chat_message_row(v_response_id) as r;
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
  if exists (
    select 1
    from public.conversations as c
    where c.id = v_conversation_id and c.deleted_at is not null
  ) then
    raise exception 'Conversation was deleted';
  end if;

  if exists (
    select 1
    from public.conversations as c
    where c.id = v_conversation_id and c.archived_at is not null
  ) then
    raise exception 'Conversation is archived';
  end if;

  select c.closed_at into v_closed_at
  from public.conversations as c
  where c.id = v_conversation_id and c.status = 'closed';

  if v_closed_at is null then
    update public.conversations as c
      set status = 'closed',
          closed_at = now(),
          closed_by = 'client',
          needs_human = false,
          updated_at = now()
      where c.id = v_conversation_id
      returning c.closed_at into v_closed_at;

    v_message_id := public.chat_add_system_message(v_conversation_id, 'system', 'Диалог завершён клиентом', p_client_message_id);
  else
    select m.id into v_existing_message_id
    from public.messages as m
    where m.conversation_id = v_conversation_id
      and m.sender = 'system'
      and m.body in ('Диалог завершён клиентом','Диалог завершён')
    order by m.created_at desc, m.id desc
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
             select 1
             from public.conversation_ratings as cr
             where cr.conversation_id = c.id and cr.closed_at_snapshot = c.closed_at
           ) as rating_submitted
    from public.messages as m
    join public.conversations as c on c.id = m.conversation_id
    where m.id = v_message_id;
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
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;

  if exists (
    select 1
    from public.conversations as c
    where c.id = p_conversation_id and c.deleted_at is not null
  ) then
    raise exception 'Conversation was deleted';
  end if;

  update public.conversations as c
    set status = 'closed',
        closed_at = now(),
        closed_by = 'owner',
        updated_at = now()
    where c.id = p_conversation_id and c.archived_at is null;

  if not found then
    raise exception 'Conversation is archived or not found';
  end if;

  v_message_id := public.chat_add_system_message(p_conversation_id, 'system', 'Диалог завершён специалистом', p_client_message_id);

  return query
    select r.id, r.conversation_id, r.sender, r.body, r.created_at, r.client_message_id
    from public.w1zzydev_chat_message_row(v_message_id) as r;
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
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;

  update public.conversations as c
    set status = 'in_progress',
        closed_at = null,
        closed_by = null,
        archived_at = null,
        archived_by = null,
        updated_at = now()
    where c.id = p_conversation_id and c.deleted_at is null;

  if not found then
    raise exception 'Conversation not found';
  end if;

  v_message_id := public.chat_add_system_message(p_conversation_id, 'system', 'Диалог снова открыт', p_client_message_id);

  return query
    select r.id, r.conversation_id, r.sender, r.body, r.created_at, r.client_message_id
    from public.w1zzydev_chat_message_row(v_message_id) as r;
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
    update public.conversations as c
      set archived_at = now(),
          archived_by = auth.uid()::text,
          updated_at = now()
      where c.id = p_conversation_id and c.deleted_at is null
      returning c.*;
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
    update public.conversations as c
      set archived_at = null,
          archived_by = null,
          updated_at = now()
      where c.id = p_conversation_id and c.deleted_at is null
      returning c.*;
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

  if not exists (
    select 1
    from public.conversations as c
    where c.id = p_conversation_id and c.status = 'closed'
  ) then
    raise exception 'Conversation must be closed before permanent deletion';
  end if;

  update public.conversations as c
    set deleted_at = now(),
        deleted_by = auth.uid()::text,
        updated_at = now()
    where c.id = p_conversation_id;

  insert into public.admin_activity(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'chat.delete_permanently', 'conversation', p_conversation_id, jsonb_build_object('deleted_at', now()));

  delete from public.guest_sessions as gs where gs.conversation_id = p_conversation_id;
  delete from public.conversation_ratings as cr where cr.conversation_id = p_conversation_id;
  delete from public.assistant_runs as ar where ar.conversation_id = p_conversation_id;
  delete from public.messages as m where m.conversation_id = p_conversation_id;
  delete from public.conversations as c where c.id = p_conversation_id;
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
  update public.conversations as c
    set assistant_mode = p_mode,
        updated_at = now()
    where c.id = p_conversation_id and c.deleted_at is null;
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
    select 1
    from public.assistant_runs as ar
    where ar.conversation_id = p_conversation_id
      and ar.source_client_message_id = p_source_client_message_id
      and ar.status in ('completed','needs_human')
  ) then
    return;
  end if;

  select ar.id into v_run_id
  from public.assistant_runs as ar
  where ar.conversation_id = p_conversation_id
    and ar.source_client_message_id = p_source_client_message_id
  limit 1;

  if v_run_id is null then
    insert into public.assistant_runs as ar (conversation_id, source_client_message_id, status, mode)
    values (p_conversation_id, p_source_client_message_id, case when p_needs_human then 'needs_human' else 'started' end, 'auto')
    returning ar.id into v_run_id;
  else
    update public.assistant_runs as ar
      set status = case when p_needs_human then 'needs_human' else 'started' end,
          mode = 'auto',
          error = p_error
      where ar.id = v_run_id;
  end if;

  perform set_config('w1zzydev.guest_conversation_id', p_conversation_id::text, true);
  perform set_config('w1zzydev.sender_override', 'assistant', true);

  select m.id into v_message_id
  from public.messages as m
  where m.conversation_id = p_conversation_id
    and m.client_message_id = v_client_message_id
  limit 1;

  if v_message_id is null then
    insert into public.messages as m (conversation_id, body, client_message_id, source_client_message_id, assistant_run_id)
    values (p_conversation_id, p_body, v_client_message_id, p_source_client_message_id, v_run_id)
    returning m.id into v_message_id;
  else
    update public.messages as m
      set body = p_body,
          source_client_message_id = p_source_client_message_id,
          assistant_run_id = v_run_id
      where m.id = v_message_id;
  end if;

  perform set_config('w1zzydev.sender_override', '', true);
  perform set_config('w1zzydev.guest_conversation_id', '', true);

  update public.assistant_runs as ar
    set assistant_message_id = v_message_id,
        status = case when p_needs_human then 'needs_human' else 'completed' end,
        error = p_error,
        completed_at = now()
    where ar.id = v_run_id;

  update public.conversations as c
    set needs_human = p_needs_human,
        priority = case when p_needs_human then 'high' else c.priority end,
        status = case when p_needs_human then 'waiting_owner' else c.status end,
        assistant_processed_at = now(),
        assistant_error = p_error,
        updated_at = now()
    where c.id = p_conversation_id;

  return query
    select r.id, r.conversation_id, r.sender, r.body, r.created_at, r.client_message_id
    from public.w1zzydev_chat_message_row(v_message_id) as r;
end;
$$;

grant execute on function public.chat_guest_assistant_action(text,text,text,text,text) to anon, authenticated;
grant execute on function public.chat_guest_close(text,text) to anon, authenticated;
grant execute on function public.chat_owner_close(uuid,text) to authenticated;
grant execute on function public.chat_owner_reopen(uuid,text) to authenticated;
grant execute on function public.chat_owner_archive(uuid) to authenticated;
grant execute on function public.chat_owner_restore(uuid) to authenticated;
grant execute on function public.chat_owner_delete_permanently(uuid,text) to authenticated;
grant execute on function public.chat_owner_set_assistant_mode(uuid,text) to authenticated;
revoke execute on function public.chat_edge_save_assistant_response(uuid,text,text,boolean,text) from public, anon, authenticated;
grant execute on function public.chat_edge_save_assistant_response(uuid,text,text,boolean,text) to service_role;

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc as p
join pg_namespace as n on n.oid = p.pronamespace
where n.nspname = 'public'
and p.proname in (
  'chat_guest_close',
  'chat_owner_close',
  'chat_owner_reopen',
  'chat_owner_archive',
  'chat_owner_restore',
  'chat_owner_delete',
  'chat_owner_delete_permanently',
  'chat_assistant_action',
  'chat_guest_assistant_action'
)
order by p.proname;
