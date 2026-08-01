# Personal data flow map

Date: 2026-07-29. Region status: NOT_VERIFIED.

| # | Scenario | Route | Data | Timing | Country | Legal basis | Risk | Recommendation |
|---|---|---|---|---|---|---|---|---|
| 1 | New lead | Browser `/contact/` -> `app.js` -> `fetch(config.url + /rest/v1/leads)` -> Supabase `leads` | name, contact, contact_method, project_type, budget/description, submission_key, locale | Direct browser write before own backend | Not verified | Consent + pre-contract action | Critical localization blocker | Move first write to verified Russian backend/DB; replace direct insert with consent-aware RPC |
| 2 | First chat message | Browser widget -> `chat_guest_start` RPC -> `clients`, `conversations`, `guest_sessions`, `messages` | name, contact, category, message, page_url, guest token hash | Direct browser RPC | Not verified | Consent | Critical | Register consent atomically in start RPC after migration |
| 3 | Follow-up chat messages | Browser widget -> `chat_guest_send` RPC -> `messages` | message body, client_message_id | Direct browser RPC after session exists | Not verified | Existing chat consent/purpose | High | Do not require repeated consent per message; keep server RLS/session checks |
| 4 | Chat contact data | Browser widget/start -> Supabase `clients` | name, contact/email/social/phone | Before any Russian backend | Not verified | Consent | Critical | Russian primary backend first |
| 5 | Attachment upload | Browser -> Supabase Storage `.upload()` bucket `chat-attachments` -> `chat_guest_send_with_attachment` or related flow | file, name, MIME, size, storage_path, optional message | File goes directly to Supabase Storage | Not verified | Consent | Critical/high | Private bucket, short signed URL, Russian object storage for primary collection |
| 6 | Support request | Browser `/support/` -> `startUniversalChat()` -> `chat_guest_start` | name, contact/email, project, subject, priority, description | Direct browser RPC | Not verified | Consent | High | Dedicated support RPC with atomic consent |
| 7 | Review | Browser `/reviews/` -> REST insert `reviews` | name, company, rating, text | Direct browser write | Not verified | Consent + publication consent | High | Dedicated review RPC with consent snapshot |
| 8 | Review publication | Admin moderation -> REST patch `reviews.status` | review text/name/company/status | Admin action | Not verified | Separate publication permission | High | Store publication permission before publish |
| 9 | Client auth | Browser `/client/` -> Supabase Auth magic link/session | email, auth session, tokens in browser storage | Direct Supabase Auth | Not verified | Account access | Critical | Verify Auth region or move auth to target architecture |
| 10 | Password recovery | `/reviews/reset-password/` -> Supabase Auth recovery/update | email/session/password update | Direct Supabase Auth | Not verified | Account recovery | High | Verify Auth region/settings |
| 11 | Browser notifications | `Notification` API in `app.js` | title/body of owner/client message notification | Local browser notification after message receipt | User device | User/browser permission | Medium | Avoid full personal data in notification body where possible |
| 12 | Telegram notification | Supabase Edge Function -> `api.telegram.org/sendMessage` | minimal mode: conversation id, category, timestamp, admin URL; full mode: name/body | After DB message context lookup | Telegram country not verified | Operational notification, needs transfer assessment | Critical | Keep `TELEGRAM_NOTIFICATION_PRIVACY_MODE=minimal`; do not enable full without assessment |
| 13 | Data subject request | `/legal/data-request/` -> `create_data_subject_request` RPC after migration | name, reply_contact, request_type, description | Direct browser RPC when migration applied | Not verified | Legal obligation/request | High | Works only after SQL; identity verification manual |
| 14 | Admin actions | `/reviews/moderation/` -> Supabase Auth/REST/RPC/Realtime | leads, tickets, messages, reviews, status changes | Authenticated browser direct to Supabase | Not verified | Administration | High | Owner-only RLS and live tests required |
| 15 | Realtime | Supabase Realtime channel/postgres_changes | message row payloads, conversation status, typing broadcast | Direct WebSocket through Supabase | Not verified | Chat functionality | High | Verify RLS/realtime publication prevents чужие диалоги |
| 16 | Logs | Browser/CDN/Supabase/Edge/Telegram logs | IP, user-agent, request paths, errors, maybe message IDs | During requests | Not verified | Security/operations | High | Confirm provider retention and redaction |
| 17 | Backups | Supabase backups/PITR | DB contents incl. personal data | After DB writes | Not verified | Business continuity | Critical | Verify backup region and retention in control plane |

## Key conclusions

- Browser writes personal data directly to Supabase; there is no own Russian backend in front of primary collection.
- Contact data and files can reach Supabase before any Russian server.
- Telegram is called from Supabase Edge Function, not directly from browser.
- Minimal Telegram mode no longer sends name, phone, email, social contact, full text, attachments, signed file URL, IP or user-agent.
- Realtime transfers message payloads through Supabase; country remains unverified.
