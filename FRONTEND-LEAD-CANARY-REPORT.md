# FRONTEND LEAD CANARY REPORT

Status: `FRONTEND_LEAD_CANARY_READY`

## Summary

Frontend lead submission now has a canary-safe abstraction with three modes:
- `legacy`: existing Supabase flow only. This remains the default.
- `new_api`: sends only to the new Lead API.
- `shadow`: runs legacy first, then sends synthetic staging-only payload to Lead API.

Production frontend behavior remains legacy by default. Supabase, RPC, tables, production SQL, and `app.js` production flow were not removed or disabled.

## Frontend Providers Created

- `assets/js/lead-submission.js`
  - `createProvider`
  - `readConfig`
  - `toLeadApiPayload`
  - `createShadowPayload`
  - `mapLeadSubmissionError`
  - `safeLogPayload`

`app.js` now lazy-loads this provider and delegates form submission through it. In default `legacy` mode the same Supabase submit function is still used.

## Modes

- `legacy`: calls only `submitLeadToSupabase`; no Lead API request.
- `new_api`: calls only `POST /api/v1/leads`; does not call Supabase lead create; does not send `routeRegion`.
- `shadow`: calls legacy first; after success sends synthetic data to staging Lead API; shadow errors do not affect user-visible legacy success.

## Shadow PII Safety

Shadow payload uses fixed synthetic values:
- `Shadow Test User`
- `shadow-test@example.invalid`
- `Synthetic shadow submission`
- `source=frontend-shadow`

Real name, email, phone, message, cookies, tokens, publicToken, idempotency key, full referrer query, and raw headers are not copied.

## Idempotency

Frontend generates `clientRequestId` with `crypto.randomUUID()`.

Backend accepts optional UUID `clientRequestId`, scopes replay by backend-resolved region, and does not expose it in public DTOs.

Staging-only migration applied:
- `backend/database/migrations/20260729_002_lead_idempotency.sql`

Both staging DBs confirmed applied:
- RU: `20260729_001_leads`, `20260729_002_lead_idempotency`
- INTERNATIONAL: `20260729_001_leads`, `20260729_002_lead_idempotency`

## Feature Flags And Config

Defaults:
- `FRONTEND_LEAD_SUBMISSION_MODE=legacy`
- `LEAD_API_BASE_URL=`
- `LEAD_API_SYNTHETIC_HEADER_ENABLED=false`
- `ALLOW_FRONTEND_SHADOW_MODE=false`
- `LEAD_API_TIMEOUT_MS=10000`

Production guards:
- localhost Lead API URL is forbidden.
- synthetic header is forbidden.
- shadow mode is forbidden unless explicitly allowed.

## Files Changed

Frontend:
- `app.js`
- `assets/js/lead-submission.js`

Backend:
- `backend/api/v1/leads/validation/LeadValidator.js`
- `backend/api/v1/leads/factories/LeadFactory.js`
- `backend/api/v1/leads/services/LeadService.js`
- `backend/api/v1/leads/mappers/LeadMapper.js`
- `backend/api/v1/leads/repositories/LeadRepository.js`
- `backend/api/v1/leads/repositories/InMemoryLeadRepository.js`
- `backend/api/v1/leads/repositories/PostgresLeadRepository.js`
- `backend/database/migrations/20260729_002_lead_idempotency.sql`
- `backend/database/tests/migration-validation.test.js`
- `backend/scripts/staging-db.js`
- `backend/scripts/staging-server.js`
- `backend/scripts/staging-frontend.js`
- `backend/scripts/frontend-lead-e2e.js`
- `backend/tests/frontend-leads.test.js`
- `backend/package.json`
- `backend/.env.staging.example`
- `backend/.env.test.example`
- `backend/docs/frontend-lead-integration.md`
- `backend/docs/frontend-lead-shadow-mode.md`
- `backend/docs/frontend-lead-idempotency.md`
- `backend/docs/frontend-lead-security.md`
- `backend/docs/frontend-lead-staging-test.md`
- `backend/docs/lead-api-contract.md`

## Test Results

Executed successfully:
- `npm run staging:migrate`
- `npm run test:frontend-leads`
- `npm run test:leads`
- `npm run test:persistence`
- `npm run check`
- `npm run test:routing`
- `RUN_POSTGRES_INTEGRATION_TESTS=true npm run test:postgres`
- `npm run staging:smoke`
- `LEAD_API_BASE_URL=http://127.0.0.1:8787 npm run staging:e2e:leads`
- `npm run build`
- `RUN_POSTGRES_INTEGRATION_TESTS=true npm run test:all`
- `npm run db:staging:status`

Docker PostgreSQL confirmed healthy:
- `w1zzydev-lead-staging-postgres`
- `127.0.0.1:55432`

## Routing Verification

Frontend-to-backend E2E confirmed:
- RU synthetic submit created `expected=1`, `other=0`.
- INTERNATIONAL synthetic submit created `expected=1`, `other=0`.
- Shadow submit kept legacy success and created synthetic-only staging row.

## Legacy Fallback

Confirmed by unit tests:
- default mode is `legacy`.
- invalid mode falls back to `legacy`.
- legacy mode calls only legacy provider.
- legacy failure does not run shadow.
- shadow failure does not break legacy success.

## Production Impact

No production database was connected.
No production SQL was applied.
No commit or push was performed.
Supabase legacy flow remains present and default.
Frontend design and UX copy remain unchanged for legacy success.

## Remaining Limitations

- Canary modes require explicit runtime config.
- Staging E2E uses synthetic provider-level submit rather than a real browser automation dependency.
- Public token is not persisted in plaintext; idempotent PostgreSQL replay is verified by duplicate prevention/count, not by re-emitting the original token.

## Next Stage

Prepare controlled canary runtime configuration and browser-level staging validation before any production consideration.

Final status: `FRONTEND_LEAD_CANARY_READY`
