-- W1ZZYDEV consent-required RPC wrappers/deltas.
-- STATUS: BLOCKED / DO NOT APPLY AS SERVER ENFORCEMENT.
--
-- Review result on 2026-07-29:
-- The previous draft replaced public.chat_guest_send with an extra p_consent_accepted argument.
-- That is unsafe because:
-- 1. It changes the RPC signature expected by the current frontend.
-- 2. It would require consent on every follow-up chat message, while the consent purpose/version is already accepted at dialog start.
-- 3. It does not solve atomic logging for lead/review/support creation.
-- 4. It can break existing clients before the frontend and production RPC are migrated together.
--
-- This file is intentionally a no-op migration marker until the database schema can be reproduced locally
-- or reviewed against the live production RPC definitions in a read-only dump.
--
-- Required safe follow-up migration:
-- - add server-side consent enforcement to the first write operation for each data collection purpose;
-- - chat: register consent atomically inside public.chat_guest_start, not public.chat_guest_send;
-- - lead: use a SECURITY DEFINER RPC instead of direct REST insert into public.leads;
-- - review: use a SECURITY DEFINER RPC instead of direct REST insert into public.reviews;
-- - support/data subject request: insert request + legal_consent in one transaction;
-- - keep existing public RPC signatures or deploy frontend and RPC change atomically;
-- - qualify all table references with aliases to avoid PostgreSQL 42702.

do $$
begin
  raise notice '20260728_003 is a no-op marker. Server-side consent enforcement remains pending.';
end $$;
