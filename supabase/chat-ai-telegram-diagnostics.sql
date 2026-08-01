-- W1ZZYDEV AI + Telegram diagnostics.
-- Safe read-only checks after running supabase/chat-ai-telegram-notifications.sql.
-- This file does not insert, update, delete, truncate or drop data.

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
order by p.proname, arguments;

select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
and tablename in ('messages', 'conversations', 'guest_sessions', 'assistant_runs', 'assistant_settings', 'assistant_knowledge', 'chat_notifications')
order by tablename;

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
and tablename in ('messages', 'conversations', 'guest_sessions', 'assistant_runs', 'chat_notifications')
order by tablename, policyname;

select
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
and indexname in (
  'messages_conversation_client_message_uidx',
  'messages_one_assistant_reply_per_source_uidx',
  'assistant_runs_source_message_uidx',
  'assistant_runs_conversation_client_message_uidx',
  'chat_notifications_message_channel_uidx'
)
order by indexname;

select
  routine_name,
  privilege_type,
  grantee
from information_schema.routine_privileges
where routine_schema = 'public'
and routine_name in (
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
order by routine_name, grantee;
