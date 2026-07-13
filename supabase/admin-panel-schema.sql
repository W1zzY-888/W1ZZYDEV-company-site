-- W1ZZYDEV Supabase admin panel schema.
-- Run this in the Supabase SQL editor for the test project first.
-- The script is idempotent: it can be executed again without deleting data.
-- No service role key is required or expected in frontend code.

-- ============================================================
-- REQUIRED SETTING
-- Replace only the value below with your existing Supabase Auth user id.
-- Example: '11111111-1111-1111-1111-111111111111'
-- Do not use email as the owner check. OWNER access is based on auth.uid().
-- ============================================================
create extension if not exists pgcrypto;

create table if not exists public.w1zzydev_setup_settings (
  id boolean primary key default true,
  owner_user_id text not null,
  updated_at timestamptz not null default now(),
  constraint w1zzydev_setup_settings_single_row check (id = true)
);

alter table public.w1zzydev_setup_settings enable row level security;
revoke all on public.w1zzydev_setup_settings from anon, authenticated;

insert into public.w1zzydev_setup_settings(id, owner_user_id, updated_at)
values (true, '21a1aa95-46bc-44f3-801b-f5ecc5d958a9', now())
on conflict (id) do update
set owner_user_id = excluded.owner_user_id,
    updated_at = now();

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  constraint admin_profiles_role_owner_only check (role = 'owner')
);

create unique index if not exists admin_profiles_single_owner_uidx
  on public.admin_profiles ((role))
  where role = 'owner';

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  contact text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clients_auth_user_id_uidx
  on public.clients(auth_user_id)
  where auth_user_id is not null;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  contact text not null,
  project_type text not null,
  description text not null,
  source text not null default 'website',
  status text not null default 'new',
  conversation_id uuid,
  submission_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.leads add column if not exists conversation_id uuid;
alter table public.leads add column if not exists submission_key text;
alter table public.leads add column if not exists source text not null default 'website';
alter table public.leads add column if not exists status text not null default 'new';
alter table public.leads add column if not exists updated_at timestamptz not null default now();

create unique index if not exists leads_submission_key_uidx
  on public.leads(submission_key)
  where submission_key is not null;

alter table public.leads
  drop constraint if exists leads_status_check,
  add constraint leads_status_check
  check (status in ('new','in_progress','waiting_client','completed','archived','spam')) not valid;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  lead_id uuid references public.leads(id) on delete cascade,
  support_ticket_id uuid,
  subject text not null default 'Заявка W1ZZYDEV',
  unread_for_owner integer not null default 0,
  unread_for_client integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conversations_lead_id_uidx
  on public.conversations(lead_id)
  where lead_id is not null;

alter table public.leads
  drop constraint if exists leads_conversation_fk,
  add constraint leads_conversation_fk
  foreign key (conversation_id) references public.conversations(id) on delete set null;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  sender text not null default 'client',
  body text not null,
  read_by_owner_at timestamptz,
  read_by_client_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages
  drop constraint if exists messages_sender_check,
  add constraint messages_sender_check
  check (sender in ('owner','client','system')) not valid;

alter table public.messages
  drop constraint if exists messages_body_check,
  add constraint messages_body_check
  check (char_length(body) between 1 and 2000 and body !~ '[<>]') not valid;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  subject text not null,
  project text,
  priority text not null default 'normal',
  description text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets
  drop constraint if exists support_tickets_priority_check,
  add constraint support_tickets_priority_check
  check (priority in ('low','normal','high','urgent')) not valid;

alter table public.support_tickets
  drop constraint if exists support_tickets_status_check,
  add constraint support_tickets_status_check
  check (status in ('open','in_progress','waiting_client','resolved','closed')) not valid;

alter table public.conversations
  drop constraint if exists conversations_support_ticket_fk,
  add constraint conversations_support_ticket_fk
  foreign key (support_ticket_id) references public.support_tickets(id) on delete cascade;

create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint admin_activity_no_secrets check (metadata::text !~* '(password|token|secret|cookie|otp)')
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  rating integer not null default 5,
  text text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  moderated_at timestamptz
);

alter table public.reviews add column if not exists status text not null default 'pending';
alter table public.reviews add column if not exists moderated_at timestamptz;

alter table public.reviews
  drop constraint if exists reviews_status_check,
  add constraint reviews_status_check
  check (status in ('pending','published','rejected')) not valid;

alter table public.reviews
  drop constraint if exists reviews_rating_check,
  add constraint reviews_rating_check
  check (rating between 1 and 5) not valid;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'owner'
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

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
  created_client_id uuid;
  created_conversation_id uuid;
begin
  insert into public.clients(name, contact)
  values (new.name, new.contact)
  returning id into created_client_id;

  insert into public.conversations(client_id, lead_id, subject, unread_for_owner)
  values (created_client_id, new.id, 'Заявка: ' || new.project_type, 1)
  returning id into created_conversation_id;

  update public.leads
     set client_id = created_client_id,
         conversation_id = created_conversation_id,
         updated_at = now()
   where id = new.id;

  return new;
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
begin
  select client_id into dialog_client_id
  from public.conversations
  where id = new.conversation_id;

  if dialog_client_id is null then
    raise exception 'Conversation is not linked to a client';
  end if;

  new.body := left(trim(coalesce(new.body, '')), 2000);

  if public.is_owner() then
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

create or replace function public.update_conversation_after_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sender = 'owner' then
    update public.conversations
       set unread_for_client = unread_for_client + 1,
           updated_at = now()
     where id = new.conversation_id;
  elsif new.sender = 'client' then
    update public.conversations
       set unread_for_owner = unread_for_owner + 1,
           updated_at = now()
     where id = new.conversation_id;
  end if;
  return new;
end;
$$;

create or replace function public.normalize_review_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.name := left(trim(regexp_replace(coalesce(new.name, ''), '\s+', ' ', 'g')), 80);
  new.company := nullif(left(trim(regexp_replace(coalesce(new.company, ''), '\s+', ' ', 'g')), 120), '');
  new.text := left(trim(coalesce(new.text, '')), 2000);
  new.rating := greatest(1, least(5, coalesce(new.rating, 5)));
  if not public.is_owner() then
    new.status := 'pending';
    new.moderated_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists leads_normalize_before_insert on public.leads;
create trigger leads_normalize_before_insert
before insert on public.leads
for each row execute function public.normalize_lead_before_insert();

drop trigger if exists leads_create_dialog_before_insert on public.leads;
drop trigger if exists leads_create_dialog_after_insert on public.leads;
create trigger leads_create_dialog_after_insert
after insert on public.leads
for each row execute function public.create_dialog_for_lead();

drop trigger if exists messages_normalize_before_insert on public.messages;
create trigger messages_normalize_before_insert
before insert on public.messages
for each row execute function public.normalize_message_before_insert();

drop trigger if exists messages_update_conversation_after_insert on public.messages;
create trigger messages_update_conversation_after_insert
after insert on public.messages
for each row execute function public.update_conversation_after_message();

drop trigger if exists reviews_normalize_before_insert on public.reviews;
create trigger reviews_normalize_before_insert
before insert on public.reviews
for each row execute function public.normalize_review_before_insert();

alter table public.admin_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.support_tickets enable row level security;
alter table public.admin_activity enable row level security;
alter table public.reviews enable row level security;

revoke all on public.admin_profiles from anon, authenticated;
revoke all on public.clients from anon, authenticated;
revoke all on public.leads from anon, authenticated;
revoke all on public.conversations from anon, authenticated;
revoke all on public.messages from anon, authenticated;
revoke all on public.support_tickets from anon, authenticated;
revoke all on public.admin_activity from anon, authenticated;
revoke all on public.reviews from anon, authenticated;

grant select on public.clients, public.leads, public.conversations, public.messages, public.support_tickets, public.admin_activity, public.reviews to authenticated;
grant insert(name, contact, project_type, description, source, submission_key) on public.leads to anon, authenticated;
grant update(status, updated_at) on public.leads to authenticated;
grant insert(conversation_id, body) on public.messages to authenticated;
grant update(unread_for_owner, unread_for_client, updated_at) on public.conversations to authenticated;
grant update(status, updated_at) on public.support_tickets to authenticated;
grant insert(name, company, rating, text, status) on public.reviews to anon, authenticated;
grant update(status, moderated_at) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;

drop policy if exists "owner read admin profiles" on public.admin_profiles;
create policy "owner read admin profiles" on public.admin_profiles
for select using (public.is_owner());

drop policy if exists "owner reads clients" on public.clients;
create policy "owner reads clients" on public.clients
for select using (public.is_owner());

drop policy if exists "client reads own profile" on public.clients;
create policy "client reads own profile" on public.clients
for select using (auth.uid() = auth_user_id);

drop policy if exists "owner manages clients" on public.clients;
create policy "owner manages clients" on public.clients
for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists "public creates leads" on public.leads;
create policy "public creates leads" on public.leads
for insert to anon, authenticated
with check (
  status = 'new'
  and client_id is null
  and conversation_id is null
  and char_length(name) between 1 and 80
  and char_length(contact) between 3 and 160
  and char_length(project_type) between 2 and 80
  and char_length(description) between 10 and 4000
  and name !~ '[<>]' and contact !~ '[<>]' and project_type !~ '[<>]' and description !~ '[<>]'
);

drop policy if exists "owner reads leads" on public.leads;
create policy "owner reads leads" on public.leads
for select using (public.is_owner());

drop policy if exists "owner updates leads" on public.leads;
create policy "owner updates leads" on public.leads
for update using (public.is_owner()) with check (public.is_owner());

drop policy if exists "client reads own leads" on public.leads;
create policy "client reads own leads" on public.leads
for select using (
  exists (select 1 from public.clients c where c.id = leads.client_id and c.auth_user_id = auth.uid())
);

drop policy if exists "owner reads conversations" on public.conversations;
create policy "owner reads conversations" on public.conversations
for select using (public.is_owner());

drop policy if exists "owner updates conversations" on public.conversations;
create policy "owner updates conversations" on public.conversations
for update using (public.is_owner()) with check (public.is_owner());

drop policy if exists "client reads own conversations" on public.conversations;
create policy "client reads own conversations" on public.conversations
for select using (
  exists (select 1 from public.clients c where c.id = conversations.client_id and c.auth_user_id = auth.uid())
);

drop policy if exists "owner reads messages" on public.messages;
create policy "owner reads messages" on public.messages
for select using (public.is_owner());

drop policy if exists "owner sends messages" on public.messages;
create policy "owner sends messages" on public.messages
for insert with check (public.is_owner() and sender = 'owner');

drop policy if exists "client reads own messages" on public.messages;
create policy "client reads own messages" on public.messages
for select using (
  exists (
    select 1 from public.conversations co
    join public.clients c on c.id = co.client_id
    where co.id = messages.conversation_id and c.auth_user_id = auth.uid()
  )
);

drop policy if exists "client sends own messages" on public.messages;
create policy "client sends own messages" on public.messages
for insert with check (
  sender = 'client'
  and exists (
    select 1 from public.conversations co
    join public.clients c on c.id = co.client_id
    where co.id = messages.conversation_id and c.auth_user_id = auth.uid() and c.id = messages.client_id
  )
);

drop policy if exists "owner reads support tickets" on public.support_tickets;
create policy "owner reads support tickets" on public.support_tickets
for select using (public.is_owner());

drop policy if exists "owner updates support tickets" on public.support_tickets;
create policy "owner updates support tickets" on public.support_tickets
for update using (public.is_owner()) with check (public.is_owner());

drop policy if exists "client reads own support tickets" on public.support_tickets;
create policy "client reads own support tickets" on public.support_tickets
for select using (
  exists (select 1 from public.clients c where c.id = support_tickets.client_id and c.auth_user_id = auth.uid())
);

drop policy if exists "owner reads admin activity" on public.admin_activity;
create policy "owner reads admin activity" on public.admin_activity
for select using (public.is_owner());

drop policy if exists "owner inserts admin activity" on public.admin_activity;
create policy "owner inserts admin activity" on public.admin_activity
for insert with check (public.is_owner());

drop policy if exists "owner reads reviews" on public.reviews;
create policy "owner reads reviews" on public.reviews
for select using (public.is_owner());

drop policy if exists "owner updates reviews" on public.reviews;
create policy "owner updates reviews" on public.reviews
for update using (public.is_owner()) with check (public.is_owner());

drop policy if exists "owner deletes reviews" on public.reviews;
create policy "owner deletes reviews" on public.reviews
for delete using (public.is_owner());

drop policy if exists "public reads published reviews" on public.reviews;
create policy "public reads published reviews" on public.reviews
for select using (status = 'published');

drop policy if exists "public creates pending reviews" on public.reviews;
create policy "public creates pending reviews" on public.reviews
for insert to anon, authenticated
with check (
  status = 'pending'
  and char_length(name) between 1 and 80
  and char_length(text) between 10 and 2000
  and rating between 1 and 5
  and name !~ '[<>]' and coalesce(company, '') !~ '[<>]' and text !~ '[<>]'
);

do $$
declare
  owner_user_id_text text;
  owner_user_id_value uuid;
begin
  select owner_user_id into owner_user_id_text
  from public.w1zzydev_setup_settings
  limit 1;

  if owner_user_id_text is null
     or owner_user_id_text = 'PASTE_YOUR_SUPABASE_AUTH_USER_ID_HERE'
     or owner_user_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise notice 'W1ZZYDEV: replace PASTE_YOUR_SUPABASE_AUTH_USER_ID_HERE with the OWNER Supabase Auth user id and run this script again.';
  else
    owner_user_id_value := owner_user_id_text::uuid;
    insert into public.admin_profiles(user_id, role)
    values (owner_user_id_value, 'owner')
    on conflict (user_id) do update set role = excluded.role;
    raise notice 'W1ZZYDEV: OWNER configured for user id %.', owner_user_id_value;
  end if;
end;
$$;
