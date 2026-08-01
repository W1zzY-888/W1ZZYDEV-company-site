# Lead Persistence Report

Status: `LEAD_PERSISTENCE_READY`.

Lead persistence is implemented for backend/staging preparation only. No production database is connected, no migrations were applied, no Supabase repository was added, and the production frontend flow remains unchanged.

## Implemented

- PostgreSQL-compatible `PostgresLeadRepository`.
- Existing `InMemoryLeadRepository` preserved.
- `LeadRepository` contract expanded with existence, internal lookup, hard delete, soft delete, and health methods.
- `RegionLeadRepositoryResolver` for region-specific repository selection.
- `DisabledDatabaseProvider`, `InMemoryDatabaseProvider`, and `PostgresDatabaseProvider`.
- HMAC-SHA-256 `TokenHasher` with secret/version config and constant-time verification.
- `FieldEncryptionProvider` contract with disabled and test-only noop implementations.
- Staging-only SQL migration and rollback.
- Migration validation script.
- Persistence tests and repository contract-style checks.
- Safe component health via `LeadPersistenceHealth`.

## DatabaseProvider

`PostgresDatabaseProvider` supports connect, disconnect, query, transaction, health check, timeout, and graceful shutdown semantics. It requires an injected client or staging integration; no driver or connection is hardcoded. `DisabledDatabaseProvider` fails closed when a regional DB is not configured.

## Repositories

- `InMemoryLeadRepository`: default safe mode, non-durable.
- `PostgresLeadRepository`: parameterized SQL, token hash lookup, soft delete, routing metadata persistence.

`LeadService` receives a resolver through DI and does not know which repository implementation is used.

## Region Selection

`RoutingProvider` determines region before write. `RegionLeadRepositoryResolver` selects only the repository for that region.

There is no cross-region fallback. If RU repository is unavailable, RU writes fail with infrastructure error and never use INTERNATIONAL. The same rule applies in reverse.

## Public Token Storage

The public token remains opaque and URL-safe. PostgreSQL stores only `public_token_hash` as `version:HMAC-SHA-256(token, secret)`. Plaintext public token is returned only at creation time from memory/request context and is not stored in Postgres rows.

## Encryption

Production encryption is a contract, not implemented custom crypto. Prepared fields are `name`, `contact_value`, and `message`. Current staging schema keeps plaintext-compatible columns until an external/provider-backed encryption implementation is selected. `NoOpFieldEncryptionProvider` is test-only and forbidden in production. Disabled encryption fails closed when used.

## Migrations

Created:

- `backend/database/migrations/20260729_001_leads.sql`
- `backend/database/migrations/20260729_001_leads.down.sql`

Constraints and indexes:

- UUID primary key.
- unique `public_token_hash`.
- `region` check for `RU` / `INTERNATIONAL`.
- status check.
- indexes on region, status, created_at.
- soft delete `deleted_at`.
- immutable region trigger.
- updated_at trigger.

Migration validation was run locally; migration was not applied.

## Tests

Executed:

- `npm run test:persistence`
- `npm run test:leads`
- `npm run check`
- `npm run build`

Covered:

- InMemory repository contract.
- Postgres repository contract with fake provider.
- create persists allowed fields.
- public token plaintext is not stored in Postgres row.
- token hash lookup.
- invalid token lookup.
- internal id hidden in DTO.
- RU/INTERNATIONAL repository routing.
- repository unavailable fails without fallback.
- region immutable on repository update.
- soft delete and public lookup behavior.
- status validation.
- transaction rollback path through provider contract.
- oversized/unsupported metadata rejection.
- SQL injection payload parameterization.
- prototype pollution payload rejection.
- missing hash secret fail closed.
- noop encryption forbidden in production.
- disabled encryption fail closed.
- safe logging.
- health output hides connection info.
- migration validation.
- region/status constraints and routing metadata in migration.

## PostgreSQL Tests

No live PostgreSQL database was used. PostgreSQL repository tests were executed against a fake injected provider/client to verify SQL shape, parameter arrays, token hashing, transactions, and row mapping without network or production credentials.

Skipped: live PostgreSQL integration and schema drift check, because no staging database was explicitly provided.

## Config Keys Added

- `LEAD_REPOSITORY_MODE`
- `RU_DATABASE_MODE`
- `INTERNATIONAL_DATABASE_MODE`
- `RU_DATABASE_URL`
- `INTERNATIONAL_DATABASE_URL`
- `RU_DATABASE_SSL`
- `INTERNATIONAL_DATABASE_SSL`
- `DATABASE_CONNECT_TIMEOUT_MS`
- `DATABASE_QUERY_TIMEOUT_MS`
- `DATABASE_POOL_MIN`
- `DATABASE_POOL_MAX`
- `PUBLIC_TOKEN_HASH_SECRET`
- `PUBLIC_TOKEN_HASH_VERSION`
- `FIELD_ENCRYPTION_MODE`

## Remaining Before Staging Database

- Choose staging PostgreSQL providers for RU and INTERNATIONAL.
- Inject an actual PostgreSQL client/driver behind `PostgresDatabaseProvider`.
- Provide non-production token hash secret through environment.
- Select production-grade field encryption provider.
- Run migrations in staging only.
- Add live schema drift checks against staging.
- Add auth/rate limiting before exposing any real endpoint.

## Production Flow

Production flow did not change. `app.js`, frontend forms, legacy legal/data request flow, Supabase config, Supabase RPC, Supabase tables, and production SQL were not changed in this stage.

No commit/push performed. No production SQL applied. No migrations applied.
