# W1ZZYDEV legal readiness report

Date: 2026-07-29.

Overall status: NOT_READY_FOR_LEGAL_RELEASE.

This report does not claim full legal compliance and does not guarantee absence of fines. It records technical readiness, blockers and manual verification required before any legal release.

## Region verification

- Supabase project ref: `yeyasotjctjlplbrzwzc`
- Supabase URL: `https://yeyasotjctjlplbrzwzc.supabase.co`
- Region status: NOT_VERIFIED
- Source: local repository files plus unauthenticated DNS/HTTP/TLS diagnostics only.
- Database region: NOT_VERIFIED
- Storage region: NOT_VERIFIED
- Edge Functions region: NOT_VERIFIED
- Backups/PITR region: NOT_VERIFIED

Technical indicators only: DNS/HTTP/TLS show Cloudflare/Google Trust Services and a Cloudflare edge hint, but these are UNVERIFIED TECHNICAL INDICATOR and do not prove database location.

## Main blocker

BLOCKER: LOCATION NOT VERIFIED.

If the primary Supabase database/Storage/Auth/Edge Functions are outside Russia, direct browser collection may become:

CRITICAL_LOCALIZATION_BLOCKER.

## Direct browser data transfer

Yes. The browser writes personal data directly to Supabase REST/RPC/Auth/Storage/Reatime using the public Supabase URL. There is no verified Russian backend before primary collection.

## Telegram privacy mode

- Variable: `TELEGRAM_NOTIFICATION_PRIVACY_MODE`
- Default: `minimal`
- Minimal mode sends: conversation id, category, timestamp, protected admin URL.
- Minimal mode does not send: name, phone, email, social contact, full text, attachment, signed file URL, IP, user-agent.
- Full mode remains risky and should not be enabled without transfer/legal assessment.

## Migration states

- `20260728_001_legal_consents.sql`: NEEDS_FIX before production; dependency on existing `is_owner()`/`safe_request_ip()` and stricter alias review required.
- `20260728_002_data_subject_requests.sql`: READY for staging only; production behavior pending migration.
- `20260728_003_consent_required_rpc_wrappers.sql`: BLOCKED/no-op marker; previous unsafe RPC signature change removed.
- `20260728_004_retention_dry_run.sql`: READY for staging if archive columns exist.

Local SQL verification: BLOCKED: REPOSITORY CANNOT REPRODUCE DATABASE SCHEMA in this environment because Supabase CLI/Docker are not installed.

## Form states

See `docs/consent-enforcement-matrix.md`.

No form is `FULLY_ENFORCED` while production SQL is not applied and several flows still use direct REST inserts.

## Regressions found and fixed in this stage

- Fixed runtime order bug: `initializeLegalUi()` previously ran before `legalConfig` initialization.
- Fixed chat consent UX: follow-up messages no longer require repeated checkbox acceptance.
- Fixed unsafe SQL migration 003: converted to explicit no-op/blocker marker instead of changing `chat_guest_send`.
- Fixed Telegram minimal mode to avoid sending potentially user-controlled `subject`.
- Removed public `TODO_REQUIRED` marker from SQL legal document snapshots.

## Checks performed

- `node --check app.js`
- Static search for `TODO_REQUIRED` in public HTML/legal pages.
- Static search for network/external recipients: Supabase, Auth, Storage, Realtime, Telegram, CDN, analytics/pixels.
- Read-only DNS/TLS/header diagnostics for `yeyasotjctjlplbrzwzc.supabase.co`.
- Local static server: `python3 -m http.server 8097`.
- Browser smoke test on `/contact/`, `/reviews/`, `/support/`, `/client/`, `/legal/`, `/legal/data-request/`.

Browser smoke result: no console errors detected on tested pages; footer legal links present; consent controls present where expected; chat start has consent; chat reply does not require repeated consent.

## Remaining regressions/risks

- `/legal/data-request/` form depends on unapplied migration 002; until then it is not server-functional.
- Server-side consent logging is not atomic for lead, review, support or chat start.
- CDN-hosted Supabase SDK and devicons still expose request metadata to jsDelivr.
- Mobile/browser visual QA was not executed in this environment.
- Deno check could not run because Deno is not installed.

## Manual owner actions

- Verify Supabase region from authenticated control plane or CLI and document evidence.
- Verify Storage, Edge Functions, Auth, logs, read replicas and backups/PITR regions.
- Fill operator details listed in `docs/operator-data-to-fill.md`.
- Decide retention periods with legal counsel.
- Assess cross-border transfer to Supabase, Telegram, CDN, GitHub Pages and social/contact services.
- Evaluate/complete Roskomnadzor notification outside code.
- Have Russian counsel review all legal pages and internal templates.

## Publication gate

- Frontend legal UI/security minimization: PARTIALLY_READY after local browser QA.
- SQL-backed consent/data subject request/retention features: not working until migrations are reviewed, staged and applied.
- Personal data collection for Russian citizens: do not treat as safe until localization is resolved.

Final allowed status: MANUAL_VERIFICATION_REQUIRED / NOT_READY_FOR_LEGAL_RELEASE.
