# RU network denylist and verification

Do not enable production blocking yet. Start with staging and report-only policies.

## RU session must not connect to

- `*.supabase.co` for REST, RPC, Auth, Storage, Realtime, Edge Functions.
- `api.telegram.org`.
- Foreign analytics or session replay.
- Foreign object storage/CDN that can receive personal data.
- Foreign logs, Sentry-like telemetry, error beacons, or file preview services.

## Controls

- Separate CSP/connect-src profile for RU route.
- Reverse proxy allowlist for RU API dependencies.
- Server-side egress rules for RU backend.
- No frontend keys for RU DB/storage.
- No third-party scripts on RU personal data pages unless legally and technically approved.

## Verification

- DevTools Network: submit RU lead/chat/file/auth and confirm no denied hosts.
- Playwright route monitor: fail test on `supabase.co`, `api.telegram.org`, foreign analytics for RU sessions.
- CSP report-only collection in staging.
- Reverse proxy access log allowlist diff.
- Backend egress log sampling without personal data.
