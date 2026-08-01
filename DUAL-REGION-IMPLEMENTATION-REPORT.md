# Dual-region implementation report

Status: `ARCHITECTURE_PREPARED`.

This is not production-ready and does not remove the current blocker for Russian production processing. RU backend, RU storage, RU auth, admin aggregation API, CSP enforcement, and localized final legal texts still need implementation and owner approval.

## Implemented in code

- Added neutral frontend data API files under `assets/js/data-api/`.
- Added feature flags with safe defaults:
  - `DUAL_REGION_ENABLED=false`
  - `RU_DATA_ROUTE_ENABLED=false`
  - `DIRECT_SUPABASE_LEGACY_MODE=true`
  - `STRICT_RU_ROUTING=false`
- Added client-side adapter/interface classes:
  - `RuDataAdapter`
  - `InternationalDataAdapter`
  - route resolver
  - endpoint constants
  - validation helpers
- Connected the data API scripts before `app.js` on existing HTML pages.
- Added required “Страна / Country” selector to first-write/contact forms:
  - lead/contact form
  - home lead form
  - chat start form
  - support ticket form
  - review form
  - client login form
  - data subject request form
- The selector is not citizenship; it represents service/request country.
- Forms do not submit until a country is selected.
- Production behavior remains legacy because dual-region flags are disabled.

## Designed in docs

- `docs/dual-region-architecture.md`
- `docs/data-routing-contract.md`
- `docs/ru-backend-specification.md`
- `docs/dual-region-migration-plan.md`
- `docs/ru-network-denylist.md`
- `docs/ru-infrastructure-requirements.md`
- `docs/us-privacy-applicability-checklist.md`
- `docs/legal-localization-structure.md`
- `docs/dual-region-test-plan.md`

## Direct Supabase calls still remaining

The current production frontend still has direct legacy Supabase use in `app.js`, including REST/RPC, Auth, Storage, Edge Function, and Realtime flows. This is intentional for this stage because production behavior must not change until RU infrastructure exists.

Remaining legacy surfaces include:

- leads
- chat conversations/messages/presence/rating
- chat attachments
- AI Edge Function notifications
- reviews/moderation
- client portal Auth and data
- support via shared chat
- data subject request page RPC

New dual-region flows must be implemented against `/api/v1/*` before enabling `DUAL_REGION_ENABLED` or `RU_DATA_ROUTE_ENABLED`.

## Telegram minimal notification rule

For both contours, Telegram or external notification payloads may contain only:

- anonymized event id
- region
- category
- time
- event fact
- protected admin link

They must not contain name, email, phone, social handle, message text, subject, file name, signed URL, IP, or user agent.

## Safe now

- Architecture and contracts are documented.
- Adapter files exist and are disabled by default.
- Current production should continue to work in legacy Supabase mode.
- Country selector prepares route intent collection before later server migration.

## Not safe until RU infrastructure exists

- Russian personal data processing through the current browser-to-Supabase implementation.
- RU Auth through Supabase Auth.
- RU file upload through Supabase Storage.
- RU Realtime through Supabase Realtime.
- Telegram notifications containing personal data.
- Any claim that the site is production-ready for Russian personal data localization.

## Next steps

1. Select RU infrastructure provider by owner decision.
2. Build staging RU API/PostgreSQL/private storage/auth.
3. Implement `/api/v1/*` backend and international Supabase facade.
4. Move new frontend writes from legacy Supabase functions to `W1ZZYDEV_DATA_API`.
5. Build admin aggregation API with explicit origin routing.
6. Add report-only CSP/connect-src monitoring, then enforce after tests.
7. Complete RU and EN legal pages with verified operator/provider details.
8. Run `docs/dual-region-test-plan.md` before any production flag change.

## Commands

- `node --check app.js` passed.
- `node --check assets/js/data-api/*.js` passed.
- Local static HTTP checks for `/contact/`, `/reviews/`, `/support/`, `/client/` returned `200`.
- Static search confirmed direct legacy Supabase calls remain in `app.js` and `legal/data-request/index.html`.
- Playwright browser smoke was not run because the `playwright` npm module is not installed in this local project environment.

No commit/push performed. No production SQL applied. No Supabase project was disabled or deleted.
