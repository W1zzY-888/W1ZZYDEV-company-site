# External data recipients

Date: 2026-07-29.

## Factually used

| Recipient | Evidence | Data | Status |
|---|---|---|---|
| Supabase Database/REST/RPC/Auth/Realtime | `supabase-config.json`, `app.js`, Supabase SDK includes | leads, chat, support, reviews, auth email/session, realtime message payloads | Active, region NOT_VERIFIED |
| Supabase Storage | `app.js` `.storage.from('chat-attachments').upload/createSignedUrl` | attachments, file metadata | Active, region NOT_VERIFIED |
| Supabase Edge Function `chat-assistant` | `app.js` `/functions/v1/chat-assistant` | conversation/message identifiers; function fetches message context server-side | Active, region NOT_VERIFIED |
| Telegram API | `supabase/functions/chat-assistant/index.ts` | minimal: conversation id/category/time/admin link; full mode would include name/body | Active if bot secrets configured |
| jsDelivr CDN | HTML Supabase SDK, `app.js` devicons | IP/user-agent/request metadata to CDN | Active |
| Telegram/WhatsApp/Instagram/mailto links | HTML/app.js | Data user chooses to send externally | User-initiated external channel |
| GitHub Pages/custom domain hosting | repo context/CNAME | IP/user-agent/path logs by host | Active, hosting location NOT_VERIFIED |

## Conditionally used

| Recipient | Condition |
|---|---|
| OpenAI API | Only if `ENABLE_OPENAI_ASSISTANT=true` and `OPENAI_API_KEY` is configured in Edge secrets |
| Browser Notification provider/local OS | Only if user grants Notification permission |

## Disabled/not found as active scripts

- Google Analytics / `gtag`
- Yandex Metrika
- marketing pixels
- Sentry
- Google Fonts
- unpkg
- service worker
- XMLHttpRequest/EventSource direct usage

## Dead or documentation-only mentions

- Some docs mention analytics as a service offering; no active analytics loader was found.

## Unknown

- Supabase backup/log processors.
- CDN/log storage countries.
- Actual production Supabase integrations configured in dashboard.
