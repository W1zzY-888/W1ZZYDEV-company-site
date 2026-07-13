-- W1ZZYDEV client portal and support schema delta.
-- Run after supabase/admin-panel-schema.sql.
-- Idempotent and non-destructive: no table drops, truncates, data cleanup, or OWNER changes.

create extension if not exists pgcrypto;

alter table public.clients add column if not exists preferred_channel text;
alter table public.clients add column if not exists last_contact_channel text;

alter table public.leads add column if not exists contact_method text;
alter table public.leads add column if not exists preferred_channel text;
alter table public.leads add column if not exists last_contact_channel text;
alter table public.leads add column if not exists locale text;

alter table public.support_tickets add column if not exists contact_method text;
alter table public.support_tickets add column if not exists requester_name text;
alter table public.support_tickets add column if not exists requester_email text;
alter table public.support_tickets add column if not exists last_contact_channel text;

alter table public.leads
  drop constraint if exists leads_contact_method_check,
  add constraint leads_contact_method_check
  check (
    contact_method is null
    or contact_method in ('site_chat','telegram','whatsapp','instagram','email','undecided')
  ) not valid;

alter table public.clients
  drop constraint if exists clients_preferred_channel_check,
  add constraint clients_preferred_channel_check
  check (
    preferred_channel is null
    or preferred_channel in ('site_chat','telegram','whatsapp','instagram','email','undecided')
  ) not valid;

alter table public.support_tickets
  drop constraint if exists support_tickets_contact_method_check,
  add constraint support_tickets_contact_method_check
  check (
    contact_method is null
    or contact_method in ('site_chat','telegram','whatsapp','email')
  ) not valid;

create or replace function public.normalize_lead_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.id := coalesce(new.id, gen_random_uuid());
  new.name := left(trim(regexp_replace(coalesce(new.name, ''), '\s+', ' ', 'g')), 80);
  new.contact := left(trim(regexp_replace(coalesce(new.contact, ''), '\s+', ' ', 'g')), 160);
  new.contact_method := coalesce(nullif(new.contact_method, ''), nullif(new.preferred_channel, ''), 'undecided');
  new.preferred_channel := new.contact_method;
  new.last_contact_channel := new.contact_method;
  new.locale := left(trim(regexp_replace(coalesce(new.locale, 'ru'), '\s+', ' ', 'g')), 8);
  new.project_type := left(trim(regexp_replace(coalesce(new.project_type, ''), '\s+', ' ', 'g')), 80);
  new.description := left(trim(coalesce(new.description, '')), 4000);
  new.source := left(trim(regexp_replace(coalesce(new.source, 'website'), '\s+', ' ', 'g')), 120);
  new.status := 'new';
  new.client_id := null;
  new.conversation_id := null;
  new.submission_key := coalesce(nullif(left(trim(new.submission_key), 120), ''), encode(digest(new.name || '|' || new.contact || '|' || new.project_type || '|' || new.description || '|' || date_trunc('minute', now())::text, 'sha256'), 'hex'));
  new.created_at := coalesce(new.created_at, now());
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.create_dialog_for_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_client_id uuid := gen_random_uuid();
  created_conversation_id uuid := gen_random_uuid();
  detected_email text;
begin
  if new.contact ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    detected_email := lower(new.contact);
  end if;

  insert into public.clients(id, name, contact, email, preferred_channel, last_contact_channel)
  values (created_client_id, new.name, new.contact, detected_email, new.preferred_channel, new.last_contact_channel);

  insert into public.conversations(id, client_id, lead_id, subject, unread_for_owner)
  values (created_conversation_id, created_client_id, new.id, 'Заявка: ' || new.project_type, 1);

  update public.leads
     set client_id = created_client_id,
         conversation_id = created_conversation_id,
         updated_at = now()
   where id = new.id;

  return new;
end;
$$;

create or replace function public.claim_client_profile()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  claimed_count integer := 0;
begin
  if auth.uid() is null or user_email = '' then
    raise exception 'Authentication is required';
  end if;

  update public.clients
     set auth_user_id = auth.uid(),
         email = coalesce(email, user_email),
         updated_at = now()
   where lower(coalesce(email, contact)) = user_email
     and (auth_user_id is null or auth_user_id = auth.uid());

  get diagnostics claimed_count = row_count;
  return jsonb_build_object('email', user_email, 'claimed', claimed_count);
end;
$$;

create or replace function public.attach_lead_access_email(
  p_submission_key text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(left(trim(coalesce(p_email, '')), 160));
  updated_count integer := 0;
begin
  if normalized_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Valid email is required';
  end if;

  update public.clients c
     set email = normalized_email,
         preferred_channel = 'site_chat',
         last_contact_channel = 'site_chat',
         updated_at = now()
    from public.leads l
   where l.client_id = c.id
     and l.submission_key = left(trim(coalesce(p_submission_key, '')), 120)
     and c.auth_user_id is null;

  get diagnostics updated_count = row_count;

  update public.leads
     set last_contact_channel = 'site_chat',
         updated_at = now()
   where submission_key = left(trim(coalesce(p_submission_key, '')), 120);

  return jsonb_build_object('attached', updated_count);
end;
$$;

create or replace function public.create_support_ticket(
  p_name text,
  p_email text,
  p_project text,
  p_subject text,
  p_priority text,
  p_description text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(left(trim(coalesce(p_email, '')), 160));
  normalized_name text := left(trim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')), 80);
  created_client_id uuid;
  created_ticket_id uuid := gen_random_uuid();
  created_conversation_id uuid := gen_random_uuid();
begin
  if normalized_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Valid email is required';
  end if;

  if char_length(trim(coalesce(p_subject, ''))) < 3 or char_length(trim(coalesce(p_description, ''))) < 10 then
    raise exception 'Ticket subject and description are required';
  end if;

  select id into created_client_id
  from public.clients
  where lower(coalesce(email, contact)) = normalized_email
  order by created_at desc
  limit 1;

  if created_client_id is null then
    created_client_id := gen_random_uuid();
    insert into public.clients(id, name, contact, email, preferred_channel, last_contact_channel)
    values (created_client_id, normalized_name, normalized_email, normalized_email, 'site_chat', 'site_chat');
  else
    update public.clients
       set name = coalesce(nullif(normalized_name, ''), name),
           email = coalesce(email, normalized_email),
           preferred_channel = coalesce(preferred_channel, 'site_chat'),
           last_contact_channel = 'site_chat',
           updated_at = now()
     where id = created_client_id;
  end if;

  insert into public.support_tickets(
    id, client_id, requester_name, requester_email, contact_method, project,
    subject, priority, description, status, last_contact_channel
  )
  values (
    created_ticket_id,
    created_client_id,
    normalized_name,
    normalized_email,
    'site_chat',
    nullif(left(trim(regexp_replace(coalesce(p_project, ''), '\s+', ' ', 'g')), 120), ''),
    left(trim(regexp_replace(coalesce(p_subject, ''), '\s+', ' ', 'g')), 160),
    case when p_priority in ('low','normal','high','urgent') then p_priority else 'normal' end,
    left(trim(coalesce(p_description, '')), 4000),
    'open',
    'site_chat'
  );

  insert into public.conversations(id, client_id, support_ticket_id, subject, unread_for_owner)
  values (created_conversation_id, created_client_id, created_ticket_id, 'Техподдержка: ' || left(trim(p_subject), 120), 1);

  update public.support_tickets
     set conversation_id = created_conversation_id,
         updated_at = now()
   where id = created_ticket_id;

  return jsonb_build_object('ticket_id', created_ticket_id, 'conversation_id', created_conversation_id);
end;
$$;

revoke all on function public.claim_client_profile() from public;
grant execute on function public.claim_client_profile() to authenticated;

revoke all on function public.attach_lead_access_email(text,text) from public;
grant execute on function public.attach_lead_access_email(text,text) to anon, authenticated;

revoke all on function public.create_support_ticket(text,text,text,text,text,text) from public;
grant execute on function public.create_support_ticket(text,text,text,text,text,text) to anon, authenticated;

grant insert(name, contact, contact_method, preferred_channel, project_type, description, source, submission_key, locale)
  on public.leads to anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant update(status, contact_method, preferred_channel, last_contact_channel, updated_at)
  on public.leads to authenticated;
grant update(preferred_channel, last_contact_channel, updated_at)
  on public.clients to authenticated;
grant insert(conversation_id, body) on public.messages to authenticated;

drop policy if exists "public creates leads" on public.leads;
create policy "public creates leads" on public.leads
for insert to anon, authenticated
with check (
  status = 'new'
  and client_id is null
  and conversation_id is null
  and contact_method in ('site_chat','telegram','whatsapp','instagram','email','undecided')
  and preferred_channel = contact_method
  and char_length(name) between 1 and 80
  and char_length(contact) between 3 and 160
  and char_length(project_type) between 2 and 80
  and char_length(description) between 10 and 4000
  and name !~ '[<>]' and contact !~ '[<>]' and project_type !~ '[<>]' and description !~ '[<>]'
);

drop policy if exists "owner updates clients" on public.clients;
create policy "owner updates clients" on public.clients
for update using (public.is_owner()) with check (public.is_owner());
