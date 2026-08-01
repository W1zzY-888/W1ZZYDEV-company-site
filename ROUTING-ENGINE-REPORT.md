# Routing Engine Report

Status: `ROUTING_ENGINE_READY`.

The Routing Engine is implemented only inside `/backend`. It is not connected to the production frontend, Supabase, SQL, RPC, or real user traffic.

## Implemented

- Server-side `PolicyRoutingProvider` implementing the existing `RoutingProvider` contract.
- Policy version `2026-07-v1`.
- Data regions: `RU`, `INTERNATIONAL`.
- Routing signal types, confidence levels, decision reasons, and safe evaluated signal output.
- `CountryNormalizer` for RU/US/KZ/Other/Unknown from ISO, Russian names, English names, and form values.
- `PhoneCountryClassifier` for route-signal classification only.
- `LocaleClassifier` for `ru`, `ru-RU`, `ru_RU`, `en`, `en-US`, `en_US`.
- `RoutingConflictDetector`.
- `RegionLock` contract for existing resources.
- `ServerCountryResolver` interface shape through `HeaderServerCountryResolver` and `StaticServerCountryResolver`.
- Disabled internal/dev preview descriptor: `POST /api/v1/internal/routing/preview`.
- Safe routing validation against malformed input, oversized strings, unexpected keys, and prototype pollution.
- RequestContext integration through `withRoutingResult`.
- DI registration for routing provider, server country resolver, and preview endpoint.

## Files Created

- `backend/routing/constants/routing-constants.js`
- `backend/routing/types/routing-types.js`
- `backend/routing/services/CountryNormalizer.js`
- `backend/routing/services/PhoneCountryClassifier.js`
- `backend/routing/services/LocaleClassifier.js`
- `backend/routing/services/RoutingConflictDetector.js`
- `backend/routing/services/ServerCountryResolver.js`
- `backend/routing/services/RoutingPreviewEndpoint.js`
- `backend/routing/validation/RoutingInputValidator.js`
- `backend/routing/contracts/RegionLock.js`
- `backend/routing/policies/RoutingPolicy202607V1.js`
- `backend/routing/providers/PolicyRoutingProvider.js`
- `backend/routing/tests/*.js`
- `backend/docs/routing-engine.md`
- `backend/docs/routing-policy-2026-07-v1.md`
- `backend/docs/routing-conflict-matrix.md`
- `backend/docs/resource-region-lock.md`
- `backend/docs/trusted-country-resolution.md`
- `backend/docs/routing-security.md`
- `backend/README.md`

## Existing Files Changed

- `.env.example`
- `backend/package.json`
- `backend/config/defaults.js`
- `backend/config/environment.js`
- `backend/core/RequestContext.js`
- `backend/core/service-manifest.js`
- `backend/core/tokens.js`
- `backend/providers/RoutingProvider.js`
- `backend/types/contracts.js`
- `backend/routing/index.js`
- `backend/tests/run-all.js`
- `backend/docs/architecture.md`
- `backend/docs/module-map.md`

## Rule Priority

1. Existing resource region lock wins and is immutable.
2. User-selected Russia.
3. Server-side country Russia.
4. `+7` phone signal unless selected country is explicitly Kazakhstan.
5. Strong-signal conflict safe fallback to RU.
6. Russian locale safe default when there is no confirmed international signal.
7. Confirmed US/other non-RU international signals.
8. Global default.
9. Invalid input safe fallback to RU.

## Conflicts

Strong signal conflicts are resolved toward `RU`. Locale is weak and does not override confirmed US/international signals. Existing resource region is not a conflict because it has absolute priority.

## Resource Region Lock

`RegionLock` defines immutable resource region metadata for conversation, lead, support ticket, client account, review, privacy request, and attachment. It does not read DB yet. Future lookup must use an opaque public token and must not expose internal DB IDs.

## Added Settings

- `ROUTING_POLICY_VERSION=2026-07-v1`
- `ROUTING_DEFAULT_RU_FOR_RUSSIAN_LOCALE=true`
- `ROUTING_CONFLICT_SAFE_REGION=RU`
- `TRUSTED_PROXY_ENABLED=false`
- `TRUSTED_COUNTRY_HEADER=`
- `TRUSTED_PROXY_PROVIDER=`
- `ROUTING_DEBUG=false`
- `ROUTING_PREVIEW_ENDPOINT_ENABLED=false`
- `ALLOW_ROUTING_PREVIEW_IN_PRODUCTION=false`

## Logged Events

- `routing.decision`
- `routing.conflict`
- `routing.invalid_input`
- `routing.resource_lock`

Allowed log metadata: request id, resulting region, reason, confidence, policy version, conflict boolean, existing resource lock boolean.

Never logged: full IP, phone, email, name, message, address, cookies, token, public resource token, authorization, full user-agent.

## Tests Run

- `npm run check`
- `npm run test:routing`
- `npm run build`

Covered: unit routing scenarios, Application + Router + RoutingProvider integration, preview endpoint disabled by default, preview endpoint forbidden in production, prototype pollution input, oversized strings, malformed country/locale/phone, routeRegion injection, public preview resource-lock stripping, safe logs, no trusted proxy header by default, syntax check, imports check, cycle detection, and build smoke.

## Tests Not Run

No Playwright tests were run, per stage requirement. No network tests were run because routing performs no external calls.

## Why Production Flow Did Not Change

No frontend files were changed in this stage. No Supabase config, RPC, SQL migration, production HTML behavior, or legacy `app.js` flow was changed. The backend still has no production server/listener and all new preview behavior is disabled by default.

## Remaining Before First Real API

- Backend transport/server bootstrap behind `NEW_BACKEND_ENABLED`.
- Auth/middleware for internal endpoints.
- Route preflight API contract.
- Persistence of resource region locks.
- Provider implementations for RU and international contours.
- Operational monitoring and deployment model.
- Staging-only integration with frontend Data API after explicit approval.

## Known Limitations

- No real GeoIP database.
- Header country resolver is disabled and requires trusted proxy configuration.
- Phone classification only detects `+7` route signal; it is not phone validation.
- Locale is only a weak safe-default signal.
- Policy is technical routing logic, not legal compliance or citizenship determination.

No commit/push performed. No production SQL applied. Supabase was not changed or disabled.
