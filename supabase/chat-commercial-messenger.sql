-- W1ZZYDEV commercial messenger additions.
-- Idempotent: adds presence, private attachments, storage bucket policies and safe RPC.
-- Does not delete chat data, does not weaken message table RLS, does not change Telegram or AI.

create table if not exists public.chat_presence (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  actor text not null check (actor in ('client','owner')),
  last_seen_at timestamptz not null default now(),
  typing_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (conversation_id, actor)
);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  bucket_id text not null default 'chat-attachments',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  kind text not null check (kind in ('image','document')),
  created_at timestamptz not null default now()
);

create unique index if not exists message_attachments_storage_path_uidx
  on public.message_attachments(bucket_id, storage_path);
create index if not exists message_attachments_message_idx
  on public.message_attachments(message_id);
create index if not exists chat_presence_conversation_idx
  on public.chat_presence(conversation_id, updated_at);

alter table public.chat_presence enable row level security;
alter table public.message_attachments enable row level security;

revoke all on public.chat_presence from anon, authenticated;
revoke all on public.message_attachments from anon, authenticated;
grant select on public.chat_presence to anon, authenticated;
grant select on public.message_attachments to anon, authenticated;

drop policy if exists "chat presence owner reads" on public.chat_presence;
create policy "chat presence owner reads"
  on public.chat_presence for select
  using (public.is_owner());

drop policy if exists "chat presence public realtime reads" on public.chat_presence;
create policy "chat presence public realtime reads"
  on public.chat_presence for select
  using (true);

drop policy if exists "message attachments owner reads" on public.message_attachments;
create policy "message attachments owner reads"
  on public.message_attachments for select
  using (public.is_owner());

drop policy if exists "message attachments signed metadata reads" on public.message_attachments;
create policy "message attachments signed metadata reads"
  on public.message_attachments for select
  using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat attachment uploads" on storage.objects;
create policy "chat attachment uploads"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'chat-attachments'
    and (
      name like 'guest/%'
      or name like 'owner/%'
    )
  );

drop policy if exists "chat attachment signed reads" on storage.objects;
create policy "chat attachment signed reads"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'chat-attachments');

drop policy if exists "chat attachment owner deletes" on storage.objects;
create policy "chat attachment owner deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'chat-attachments' and public.is_owner());

create or replace function public.chat_attachment_kind(p_mime_type text)
returns text
language sql
immutable
as $$
  select case
    when p_mime_type in ('image/jpeg','image/png','image/webp','image/gif') then 'image'
    when p_mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) then 'document'
    else null
  end;
$$;

create or replace function public.chat_validate_attachment(
  p_storage_path text,
  p_file_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(trim(p_storage_path), '') = '' or length(p_storage_path) > 700 or p_storage_path like '%..%' then
    raise exception 'Invalid attachment path';
  end if;
  if coalesce(trim(p_file_name), '') = '' or length(p_file_name) > 160 then
    raise exception 'Invalid attachment name';
  end if;
  if public.chat_attachment_kind(p_mime_type) is null then
    raise exception 'Unsupported file type';
  end if;
  if coalesce(p_size_bytes, 0) <= 0 or p_size_bytes > 10485760 then
    raise exception 'Attachment is too large';
  end if;
end;
$$;

create or replace function public.w1zzydev_chat_message_attachments(p_message_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'bucket_id', a.bucket_id,
    'storage_path', a.storage_path,
    'file_name', a.file_name,
    'mime_type', a.mime_type,
    'size_bytes', a.size_bytes,
    'kind', a.kind
  ) order by a.created_at asc), '[]'::jsonb)
  from public.message_attachments as a
  where a.message_id = p_message_id;
$$;

drop function if exists public.chat_guest_messages(text,timestamptz,uuid);
create function public.chat_guest_messages(
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
  attachments jsonb,
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
  update public.conversations as c
    set unread_for_client = 0,
        unread_for_guest = 0
    where c.id = v_conversation_id;

  return query
    select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id,
           public.w1zzydev_chat_message_attachments(m.id) as attachments,
           c.status, c.closed_at,
           exists (
             select 1 from public.conversation_ratings as r
             where r.conversation_id = c.id
               and r.closed_at_snapshot = c.closed_at
           ) as rating_submitted
    from public.messages as m
    join public.conversations as c on c.id = m.conversation_id
    where m.conversation_id = v_conversation_id
      and (
        p_after_created_at is null
        or m.created_at > p_after_created_at
        or (m.created_at = p_after_created_at and (p_after_id is null or m.id > p_after_id))
      )
    order by m.created_at asc, m.id asc;
end;
$$;

drop function if exists public.chat_owner_messages(uuid,timestamptz,uuid);
create function public.chat_owner_messages(
  p_conversation_id uuid,
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
  attachments jsonb
)
language sql
security definer
set search_path = public
as $$
  select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id,
         public.w1zzydev_chat_message_attachments(m.id) as attachments
  from public.messages as m
  where public.is_owner()
    and m.conversation_id = p_conversation_id
    and (
      p_after_created_at is null
      or m.created_at > p_after_created_at
      or (m.created_at = p_after_created_at and (p_after_id is null or m.id > p_after_id))
    )
  order by m.created_at asc, m.id asc;
$$;

drop function if exists public.chat_guest_send(text,text,text);
create function public.chat_guest_send(
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
  client_message_id text,
  attachments jsonb
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
    select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id,
           public.w1zzydev_chat_message_attachments(m.id) as attachments
    from public.messages as m
    where m.id = v_message_id;
end;
$$;

drop function if exists public.chat_owner_send(uuid,text,text);
create function public.chat_owner_send(
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
  client_message_id text,
  attachments jsonb
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
    select 1 from public.conversations as c
    where c.id = p_conversation_id
  ) then
    raise exception 'Conversation not found';
  end if;

  if exists (
    select 1 from public.conversations as c
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
    select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id,
           public.w1zzydev_chat_message_attachments(m.id) as attachments
    from public.messages as m
    where m.id = v_message_id;
end;
$$;

create or replace function public.chat_guest_file_message(
  p_guest_token_hash text,
  p_body text,
  p_client_message_id text,
  p_storage_path text,
  p_file_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns table (
  id uuid,
  conversation_id uuid,
  sender text,
  body text,
  created_at timestamptz,
  client_message_id text,
  attachments jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
  v_message_id uuid;
  v_body text := left(trim(coalesce(nullif(p_body, ''), p_file_name)), 2000);
begin
  perform public.chat_validate_attachment(p_storage_path, p_file_name, p_mime_type, p_size_bytes);
  if public.chat_conversation_is_locked(v_conversation_id) then
    raise exception 'Conversation is closed or archived';
  end if;
  if p_storage_path not like ('guest/' || p_guest_token_hash || '/%') then
    raise exception 'Invalid guest attachment path';
  end if;

  perform set_config('w1zzydev.guest_conversation_id', v_conversation_id::text, true);
  if p_client_message_id is not null and trim(p_client_message_id) <> '' then
    select m.id
      into v_message_id
    from public.messages as m
    where m.conversation_id = v_conversation_id
      and m.client_message_id = p_client_message_id
    limit 1;
  end if;

  if v_message_id is null then
    insert into public.messages as m (conversation_id, body, client_message_id)
    values (v_conversation_id, v_body, nullif(trim(coalesce(p_client_message_id, '')), ''))
    returning m.id into v_message_id;
  else
    update public.messages as m
      set body = v_body
      where m.id = v_message_id
      returning m.id into v_message_id;
  end if;
  perform set_config('w1zzydev.guest_conversation_id', '', true);

  insert into public.message_attachments as a (
    conversation_id, message_id, storage_path, file_name, mime_type, size_bytes, kind
  )
  values (
    v_conversation_id,
    v_message_id,
    p_storage_path,
    left(trim(p_file_name), 160),
    p_mime_type,
    p_size_bytes,
    public.chat_attachment_kind(p_mime_type)
  )
  on conflict (bucket_id, storage_path) do update
    set message_id = excluded.message_id,
        conversation_id = excluded.conversation_id,
        file_name = excluded.file_name,
        mime_type = excluded.mime_type,
        size_bytes = excluded.size_bytes,
        kind = excluded.kind;

  return query
    select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id,
           public.w1zzydev_chat_message_attachments(m.id) as attachments
    from public.messages as m
    where m.id = v_message_id;
end;
$$;

create or replace function public.chat_owner_file_message(
  p_conversation_id uuid,
  p_body text,
  p_client_message_id text,
  p_storage_path text,
  p_file_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns table (
  id uuid,
  conversation_id uuid,
  sender text,
  body text,
  created_at timestamptz,
  client_message_id text,
  attachments jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
  v_body text := left(trim(coalesce(nullif(p_body, ''), p_file_name)), 2000);
begin
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;
  perform public.chat_validate_attachment(p_storage_path, p_file_name, p_mime_type, p_size_bytes);
  if public.chat_conversation_is_locked(p_conversation_id) then
    raise exception 'Conversation is closed or archived';
  end if;
  if p_storage_path not like ('owner/' || p_conversation_id::text || '/%') then
    raise exception 'Invalid owner attachment path';
  end if;

  if p_client_message_id is not null and trim(p_client_message_id) <> '' then
    select m.id
      into v_message_id
    from public.messages as m
    where m.conversation_id = p_conversation_id
      and m.client_message_id = p_client_message_id
    limit 1;
  end if;

  if v_message_id is null then
    insert into public.messages as m (conversation_id, body, client_message_id)
    values (p_conversation_id, v_body, nullif(trim(coalesce(p_client_message_id, '')), ''))
    returning m.id into v_message_id;
  else
    update public.messages as m
      set body = v_body
      where m.id = v_message_id
      returning m.id into v_message_id;
  end if;

  insert into public.message_attachments as a (
    conversation_id, message_id, storage_path, file_name, mime_type, size_bytes, kind
  )
  values (
    p_conversation_id,
    v_message_id,
    p_storage_path,
    left(trim(p_file_name), 160),
    p_mime_type,
    p_size_bytes,
    public.chat_attachment_kind(p_mime_type)
  )
  on conflict (bucket_id, storage_path) do update
    set message_id = excluded.message_id,
        conversation_id = excluded.conversation_id,
        file_name = excluded.file_name,
        mime_type = excluded.mime_type,
        size_bytes = excluded.size_bytes,
        kind = excluded.kind;

  update public.conversations as c
    set status = 'waiting_client',
        assistant_mode = 'suggest',
        needs_human = false,
        last_message_at = now(),
        updated_at = now()
    where c.id = p_conversation_id;

  return query
    select m.id, m.conversation_id, m.sender, m.body, m.created_at, m.client_message_id,
           public.w1zzydev_chat_message_attachments(m.id) as attachments
    from public.messages as m
    where m.id = v_message_id;
end;
$$;

create or replace function public.chat_guest_presence(
  p_guest_token_hash text,
  p_is_typing boolean default false
)
returns table (
  owner_last_seen_at timestamptz,
  owner_typing_until timestamptz,
  client_last_seen_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid := public.chat_assert_guest(p_guest_token_hash);
begin
  insert into public.chat_presence as p (conversation_id, actor, last_seen_at, typing_until, updated_at)
  values (v_conversation_id, 'client', now(), case when p_is_typing then now() + interval '6 seconds' else null end, now())
  on conflict (conversation_id, actor) do update
    set last_seen_at = excluded.last_seen_at,
        typing_until = excluded.typing_until,
        updated_at = now();

  return query
    select owner_p.last_seen_at, owner_p.typing_until, client_p.last_seen_at
    from public.chat_presence as client_p
    left join public.chat_presence as owner_p
      on owner_p.conversation_id = v_conversation_id
     and owner_p.actor = 'owner'
    where client_p.conversation_id = v_conversation_id
      and client_p.actor = 'client';
end;
$$;

create or replace function public.chat_owner_presence(
  p_conversation_id uuid,
  p_is_typing boolean default false
)
returns table (
  client_last_seen_at timestamptz,
  client_typing_until timestamptz,
  owner_last_seen_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_owner() then
    raise exception 'Owner only';
  end if;

  insert into public.chat_presence as p (conversation_id, actor, last_seen_at, typing_until, updated_at)
  values (p_conversation_id, 'owner', now(), case when p_is_typing then now() + interval '6 seconds' else null end, now())
  on conflict (conversation_id, actor) do update
    set last_seen_at = excluded.last_seen_at,
        typing_until = excluded.typing_until,
        updated_at = now();

  return query
    select client_p.last_seen_at, client_p.typing_until, owner_p.last_seen_at
    from public.chat_presence as owner_p
    left join public.chat_presence as client_p
      on client_p.conversation_id = p_conversation_id
     and client_p.actor = 'client'
    where owner_p.conversation_id = p_conversation_id
      and owner_p.actor = 'owner';
end;
$$;

grant execute on function public.chat_guest_messages(text,timestamptz,uuid) to anon, authenticated;
grant execute on function public.chat_owner_messages(uuid,timestamptz,uuid) to authenticated;
grant execute on function public.chat_guest_send(text,text,text) to anon, authenticated;
grant execute on function public.chat_owner_send(uuid,text,text) to authenticated;
grant execute on function public.chat_guest_file_message(text,text,text,text,text,text,bigint) to anon, authenticated;
grant execute on function public.chat_owner_file_message(uuid,text,text,text,text,text,bigint) to authenticated;
grant execute on function public.chat_guest_presence(text,boolean) to anon, authenticated;
grant execute on function public.chat_owner_presence(uuid,boolean) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_presence'
  ) then
    alter publication supabase_realtime add table public.chat_presence;
  end if;
end $$;

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc as p
join pg_namespace as n on n.oid = p.pronamespace
where n.nspname = 'public'
and p.proname in (
  'chat_guest_messages',
  'chat_owner_messages',
  'chat_guest_send',
  'chat_owner_send',
  'chat_guest_file_message',
  'chat_owner_file_message',
  'chat_guest_presence',
  'chat_owner_presence'
)
order by p.proname;
