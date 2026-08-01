# Lead Persistence

Status: `LEAD_PERSISTENCE_READY` for staging preparation only. No production database is connected and no migration has been applied.

## Modes

- `in_memory`: default, non-durable, current safe mode.
- `postgres`: PostgreSQL-compatible repository, requires configured provider and token hash secret.
- `disabled`: fail closed.

`LeadService` receives a repository resolver through DI and does not know whether storage is in-memory or PostgreSQL.

## Region Rule

`RoutingProvider` resolves `RU` or `INTERNATIONAL` before persistence. The repository resolver selects only the repository for that region. If the selected region repository is unavailable, the operation fails with `InfrastructureError`; it never falls back to the other region.

## Current Safety

`LEAD_API_ENABLED=false` by default. Both regional database modes are disabled by default. Existing production frontend still uses legacy Supabase.
