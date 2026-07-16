-- W1ZZYDEV guest message send fix.
-- Idempotent: replaces chat_guest_send only, does not delete existing data or change RLS.
-- Fixes PostgreSQL 42702 caused by ambiguous conversation_id references inside PL/pgSQL.

create or replace function public.chat_guest_send(
  p_guest_token_hash text,
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
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_message_id uuid;
  v_clean_body text := left(trim(coalesce(p_body, '')), 2000);
begin
  if v_clean_body = '' then
    raise exception 'Message body is required';
  end if;

  if public.chat_conversation_is_locked(v_conversation_id) then
    raise exception 'Conversation is closed or archived';
  end if;

  if p_client_message_id is not null and trim(p_client_message_id) <> '' then
    select m.id
      into v_message_id
    from public.messages as m
    where m.conversation_id = v_conversation_id
      and m.client_message_id = p_client_message_id
    limit 1;
  end if;

  perform set_config('w1zzydev.guest_conversation_id', v_conversation_id::text, true);

  if v_message_id is null then
    insert into public.messages as m (conversation_id, body, client_message_id)
    values (v_conversation_id, v_clean_body, nullif(trim(coalesce(p_client_message_id, '')), ''))
    returning m.id into v_message_id;
  else
    update public.messages as m
      set body = v_clean_body
      where m.id = v_message_id
      returning m.id into v_message_id;
  end if;

  perform set_config('w1zzydev.guest_conversation_id', '', true);

  return query
    select r.id, r.conversation_id, r.sender, r.body, r.created_at, r.client_message_id
    from public.w1zzydev_chat_message_row(v_message_id) as r;
end;
$$;

grant execute on function public.chat_guest_send(text,text,text) to anon, authenticated;

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc as p
join pg_namespace as n on n.oid = p.pronamespace
where n.nspname = 'public'
and p.proname = 'chat_guest_send'
order by p.proname;
