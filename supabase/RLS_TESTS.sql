-- W1ZZYDEV Supabase RLS smoke tests.
-- Run after supabase/admin-panel-schema.sql in the Supabase SQL editor.
-- This file uses transactions + rollback, so test rows are not kept.
--
-- Replace these four values before running:
-- OWNER_USER_ID: your owner auth.users.id
-- CLIENT_USER_ID: a normal client auth.users.id
-- SECOND_CLIENT_USER_ID: another normal client auth.users.id

-- ============================================================
-- 1. anon: can create a lead, cannot read leads, can only create pending review.
-- ============================================================
begin;
  set local role anon;
  select set_config('request.jwt.claim.sub', '', true);

  insert into public.leads(name, contact, project_type, description, source)
  values ('Anon Test', '@anon', 'Website', 'Anon request should become a new lead only.', 'rls-test')
  returning id, status, client_id, conversation_id;

  -- Expected: 0 rows because anon has no select access to leads.
  select count(*) as anon_visible_leads from public.leads;

  insert into public.reviews(name, company, rating, text, status)
  values ('Anon Review', 'Test', 5, 'Anon review should stay pending after trigger.', 'published')
  returning id, status;
rollback;

-- ============================================================
-- 2. ordinary client: sees only own data and cannot impersonate owner messages.
-- ============================================================
begin;
  with lead_row as (
    insert into public.leads(name, contact, project_type, description, source)
    values ('Client One', '@client-one', 'Website', 'Client-owned request for RLS check.', 'rls-test')
    returning id, client_id, conversation_id
  )
  update public.clients c
     set auth_user_id = 'CLIENT_USER_ID'::uuid
    from lead_row
   where c.id = lead_row.client_id;

  set local role authenticated;
  select set_config('request.jwt.claim.sub', 'CLIENT_USER_ID', true);

  -- Expected: client only sees rows linked to clients.auth_user_id = CLIENT_USER_ID.
  select count(*) as client_visible_leads from public.leads;
  select count(*) as client_visible_conversations from public.conversations;
  select count(*) as client_visible_messages from public.messages;

  -- Expected: inserted message sender is normalized to "client", never "owner".
  insert into public.messages(conversation_id, sender, body)
  select conversation_id, 'owner', 'Client tries to spoof owner sender.'
  from public.leads
  where contact = '@client-one'
  limit 1
  returning sender, client_id;
rollback;

-- ============================================================
-- 3. second client: cannot see the first client's data by changing ids.
-- ============================================================
begin;
  with lead_row as (
    insert into public.leads(name, contact, project_type, description, source)
    values ('Client One Hidden', '@client-one-hidden', 'Website', 'Hidden request for second-client RLS check.', 'rls-test')
    returning id, client_id, conversation_id
  )
  update public.clients c
     set auth_user_id = 'CLIENT_USER_ID'::uuid
    from lead_row
   where c.id = lead_row.client_id;

  set local role authenticated;
  select set_config('request.jwt.claim.sub', 'SECOND_CLIENT_USER_ID', true);

  -- Expected: 0 rows for data owned by another auth uid.
  select count(*) as second_client_visible_leads from public.leads;
  select count(*) as second_client_visible_conversations from public.conversations;
  select count(*) as second_client_visible_messages from public.messages;
  select count(*) as second_client_visible_tickets from public.support_tickets;
rollback;

-- ============================================================
-- 4. OWNER: can see and update administrative data.
-- ============================================================
begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', '21a1aa95-46bc-44f3-801b-f5ecc5d958a9', true);

  -- Expected: true after OWNER_USER_ID is inserted into public.admin_profiles.
  select public.is_owner() as owner_access;

  -- Expected: owner can read all admin tables.
  select count(*) as owner_visible_leads from public.leads;
  select count(*) as owner_visible_conversations from public.conversations;
  select count(*) as owner_visible_clients from public.clients;
  select count(*) as owner_visible_tickets from public.support_tickets;
  select count(*) as owner_visible_reviews from public.reviews;

  -- Expected: regular SQL insert of a second owner fails because of admin_profiles_single_owner_uidx.
  -- Uncomment only when you intentionally want to verify the constraint error:
  -- insert into public.admin_profiles(user_id, role) values (gen_random_uuid(), 'owner');
rollback;
