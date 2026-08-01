# Consent enforcement matrix

Date: 2026-07-29. Migrations are not applied.

| Page | Form ID | Checkbox ID | Purpose | Document version | Frontend validation | Server validation | Atomic logging | Status |
|---|---|---|---|---|---|---|---|---|
| `/contact/` | `project-form` | `project-form-pd-consent` | `lead_request` | `2026-07-28-draft` | Yes | No, direct REST insert to `leads` | No | FRONTEND_ONLY / PENDING_DATABASE_MIGRATION |
| home if present | `home-project-form` | `home-project-form-pd-consent` | `lead_request` | `2026-07-28-draft` | Yes | No, direct REST insert | No | FRONTEND_ONLY / PENDING_DATABASE_MIGRATION |
| chat widget start | dynamic `data-chat-start-form` | generated `w1zzy-form-pd-consent` | first chat/support request | `2026-07-28-draft` | Yes | Not yet in `chat_guest_start` | No | FRONTEND_ONLY / PENDING_DATABASE_MIGRATION |
| chat follow-up | dynamic `data-chat-reply-form` | none by design | same conversation purpose | `2026-07-28-draft` | Not repeated | Session/RLS only | No new consent expected | PENDING_DATABASE_MIGRATION for initial proof |
| `/support/` | `support-ticket-form` | `support-ticket-form-pd-consent` | `support_request` | `2026-07-28-draft` | Yes | No, uses chat start | No | FRONTEND_ONLY / PENDING_DATABASE_MIGRATION |
| `/reviews/` | `review-form` | `review-form-pd-consent` | `review_submission_and_publication` | `2026-07-28-draft` | Yes | No, direct REST insert | No | FRONTEND_ONLY / PENDING_DATABASE_MIGRATION |
| `/client/` | `client-login-form` | `client-login-form-pd-consent` | `client_auth` | `2026-07-28-draft` | Yes | Supabase Auth only; no consent RPC | No | FRONTEND_ONLY |
| `/client/` | `client-message-form` | `client-message-form-pd-consent` | `client_message` | `2026-07-28-draft` | Yes | Message RLS only; no consent RPC | No | FRONTEND_ONLY |
| `/legal/data-request/` | `data-request-form` | `data-request-form-pd-consent` | `data_subject_request` | `2026-07-28-draft` | Yes | After migration 002 | Yes after migration 002 | PENDING_DATABASE_MIGRATION |

## Finding

No form can be called `FULLY_ENFORCED` while production SQL is not applied and the direct REST insert paths remain.
