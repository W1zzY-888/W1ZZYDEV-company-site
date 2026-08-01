# W1ZZYDEV Backend

Status: `ROUTING_ENGINE_READY` for backend-internal routing only.

This backend is not connected to the current production frontend. The public site still uses the existing Supabase legacy flow.

## What Exists

- Backend Core Framework.
- Dependency injection container.
- Central config and environment loader.
- Safe logger and error system.
- Request context.
- Feature flags.
- Version-aware API router.
- Internal Routing Engine for `RU` and `INTERNATIONAL` decisions.
- Disabled internal/dev routing preview descriptor.
- Disabled Lead API module with in-memory repository.
- PostgreSQL-compatible Lead persistence layer for staging preparation.
- Local PostgreSQL staging scaffolding for Lead API.

## What Does Not Exist Yet

- Production HTTP server.
- Chat/auth/storage/CRM/Admin APIs.
- Database implementation.
- Supabase adapter.
- RU infrastructure integration.
- Notification delivery.
- Frontend switching.

## Routing Docs

- `docs/routing-engine.md`
- `docs/routing-policy-2026-07-v1.md`
- `docs/routing-conflict-matrix.md`
- `docs/resource-region-lock.md`
- `docs/trusted-country-resolution.md`
- `docs/routing-security.md`
- `docs/lead-api.md`
- `docs/lead-api-contract.md`
- `docs/lead-api-security.md`
- `docs/lead-persistence.md`
- `docs/lead-database-schema.md`
- `docs/lead-token-security.md`
- `docs/lead-encryption-contract.md`
- `docs/lead-repository-routing.md`
- `docs/lead-persistence-security.md`
- `docs/lead-database-migrations.md`
- `docs/local-postgres-staging.md`
- `docs/staging-lead-api.md`
- `docs/postgres-integration-tests.md`
- `docs/staging-security.md`
- `docs/staging-operations.md`

## Checks

```bash
npm run check
npm run test:routing
npm run test:leads
npm run test:persistence
npm run test:postgres
npm run build
```

All new routing features are disabled by default and must remain behind feature flags until a later staging implementation.
