# Lead Database Migrations

Migrations are staging-only and are not applied automatically.

Files:

- `backend/database/migrations/20260729_001_leads.sql`
- `backend/database/migrations/20260729_001_leads.down.sql`

Safety rules:

- No production credentials.
- Idempotent `IF NOT EXISTS` style where possible.
- Rollback documented in `.down.sql`.
- Validation script checks required table, constraints, indexes, and immutable-region trigger.
- No automatic execution in `npm run check`.

Validation:

```bash
node database/tests/migration-validation.test.js
```

Schema drift against a live database is not performed because no staging database is connected in this stage.
