# Dual-region personal data architecture

Status: `ARCHITECTURE_PREPARED`, not production-ready. Current Supabase project is confirmed as `eu-west-1`, Ireland, and remains the international contour until a separate migration.

## Target shape

Browser -> Unified Data API `/api/v1/*` -> server-side routing -> one of:

- RU contour: RU API, PostgreSQL in Russia, private object storage in Russia, RU auth/session service.
- International contour: International API backed by existing Supabase `eu-west-1`.

The browser never decides the final route alone. It only sends non-personal route signals first, such as selected service country and locale. The server resolves and signs/binds the route before accepting name, contact, message, password, file, token, or other personal data. If signals conflict or are insufficient, Russian-language flows default to RU.

## Flow matrix

| Flow | Where information arises | Route timing | First request | Primary write | Storage | Access | Onward transfer | Must not leave RU contour |
|---|---|---|---|---|---|---|---|---|
| Lead | Public forms | Before name/contact/message submit | `/api/v1/leads` route preflight or combined server route+write | RU PostgreSQL or Supabase leads | No file | Admin via aggregation API | International only for non-RU route | Name, contact, task, channel, IP/UA tied to lead |
| First chat | Chat start form | Before first message submit | `/api/v1/chat/conversations` | RU conversations/messages or Supabase RPC equivalent | No file | Guest by public token; admin by origin route | Only anonymized notification allowed | Name, contact, initial message, public token mapping |
| Follow-up chat | Existing public token | Existing route immutable | `/api/v1/chat/messages` | Origin contour from token | Optional via attachment flow | Guest by region-bound token | None unless route permits | Message body, token hash, conversation metadata |
| File upload | Chat/support upload | Before upload URL/body is issued | `/api/v1/chat/attachments` | Attachment metadata in origin DB | RU private object storage or Supabase Storage | Signed download through origin API | None for RU except approved processor | File, filename, MIME, signed URL, scan result tied to user |
| Support | Support form | Before subject/description submit | `/api/v1/support/tickets` | Origin support_tickets | Optional RU/international storage | Admin aggregation by region | Minimal anonymous notification | Subject, description, email, project, priority tied to user |
| Reviews | Review form | Before name/company/text submit | `/api/v1/reviews` | Origin reviews | No file | Moderation/admin by origin | Public publication only after consent/moderation | Name/company/text for RU until publication basis is valid |
| Registration | Auth form | Before email/password submit | `/api/v1/auth/register` | RU auth tables or Supabase Auth | No file | User session; admin limited | None for RU | Email, password, password hash, reset secrets |
| Login | Auth form | Before email/password or magic link flow | `/api/v1/auth/login` | Session in origin auth provider | No file | User session | None for RU | Email, login attempts, session cookie/token |
| Password reset | Reset form | Existing account region lookup before issuing token | `/api/v1/auth/password-reset` | Origin auth provider | No file | User via one-time token | None for RU | Email, reset token, password |
| Data subject request | Legal form | Before subject/contact/details submit | `/api/v1/privacy/requests` | Origin data_subject_requests | Optional evidence only in origin storage | Privacy/admin role | Only if legally assessed | Subject name, contact, request details |
| Consent log | Form acceptance | Same route as target object | `/api/v1/consents` | Origin legal_consents | No file | Audit/privacy roles | Aggregated counts only | Consent subject, contact, IP/UA tied to RU user |
| Notifications | Backend event | After primary write | Internal notification service | Origin event log | No user file | Admin recipient | Telegram only anonymized fact | Name, contact, text, file links, IP, UA |
| Realtime | Existing chat token | Token binds route | `/api/v1/chat/messages/:publicToken` plus WS/SSE/poll | Origin messages | Origin storage | Token-limited user; admin origin | No combined public stream | DB IDs, token hash, RU message body |
| Admin | Admin UI | Admin request includes explicit region filter | `/api/v1/admin/*` aggregation API | No copying between contours | Origin storage links proxied | MFA admin only | Minimal previews, no bulk copy | RU full records, raw guest tokens, signed file URLs |
| Deletion | Privacy/admin action | Existing object region | `/api/v1/privacy/requests` or admin action | Origin DB deletion/anonymization | Origin object deletion | Privacy/admin role | Tombstone only if needed | Deleted RU record contents |
| Backups | Scheduled backend job | Origin-bound | Internal job, no browser | Origin backup store | RU backups inside Russia | Restricted ops | No foreign backup for RU | Backup contents, keys, dumps |

## Hard boundaries

- No direct browser call to `*.supabase.co` for new RU-routed personal data flows.
- No RU personal data to Telegram, foreign observability, analytics, CDN logs, or international object storage.
- No Supabase fallback if RU backend is unavailable after a RU route is resolved.
- No secrets in frontend; all provider credentials stay server-side.
- One public site and one visual admin are allowed only through route-aware server APIs.
