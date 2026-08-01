# Frontend Lead Security

Production safeguards:
- Default mode is `legacy`.
- Production rejects localhost Lead API URLs.
- Production rejects synthetic staging header.
- Shadow mode is blocked in production unless explicitly allowed.

Frontend logs allow only:
- `submissionMode`
- `requestId`
- `result`
- `statusCode`
- `durationBucket`
- `countryCode`
- `shadowResult`

Logs and analytics must not include name, email, phone, message, public token, Supabase token, idempotency key, cookies, or raw headers.

New API requests do not include `routeRegion`, internal ids, database mode, raw referrer query string, tokens, or cookies.
