-- W1ZZYDEV OWNER message send fix.
-- Run after supabase/fix-chat-actions-ambiguous-id.sql.
-- Idempotent: replaces chat_owner_send only, does not delete existing data or change RLS.

alter table if exists public.conversations add column if not exists last_message_at timestamptz;

create or replace function public.chat_owner_send(
  p_conversation_id uuid,
  p_body text,
  p_client_message_id text
)
returns table (
  id uuid,
  conversation_id uuid,
  sender text,
  body text,
  created_at timestamptz,
  client_message_id text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
  v_created_at timestamptz;
  v_clean_body text := left(trim(coalesce(p_body, '')), 2000);
begin
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;

  if v_clean_body = '' then
    raise exception 'Message body is required';
  end if;

  if not exists (
    select 1
    from public.conversations as c
    where c.id = p_conversation_id
  ) then
    raise exception 'Conversation not found';
  end if;

  if exists (
    select 1
    from public.conversations as c
    where c.id = p_conversation_id
      and (c.status = 'closed' or c.archived_at is not null or c.deleted_at is not null)
  ) then
    raise exception 'Conversation is closed, archived or deleted';
  end if;

  select m.id, m.created_at
    into v_message_id, v_created_at
  from public.messages as m
  where m.conversation_id = p_conversation_id
    and m.client_message_id = p_client_message_id
  limit 1;

  if v_message_id is null then
    insert into public.messages as m (conversation_id, body, client_message_id)
    values (p_conversation_id, v_clean_body, p_client_message_id)
    returning m.id, m.created_at into v_message_id, v_created_at;
  else
    update public.messages as m
      set body = v_clean_body
      where m.id = v_message_id
      returning m.created_at into v_created_at;
  end if;

  update public.conversations as c
    set status = 'waiting_client',
        assistant_mode = 'suggest',
        needs_human = false,
        last_message_at = coalesce(v_created_at, now()),
        updated_at = now()
    where c.id = p_conversation_id;

  return query
    select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id
    from public.messages as m
    where m.id = v_message_id;
end;
$$;

grant execute on function public.chat_owner_send(uuid,text,text) to authenticated;

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc as p
join pg_namespace as n on n.oid = p.pronamespace
where n.nspname = 'public'
and p.proname = 'chat_owner_send'
order by p.proname;
