# Frontend Lead Staging Test

Ports:
- Lead API: `127.0.0.1:8787`
- Optional static frontend: `127.0.0.1:8080`
- PostgreSQL: `127.0.0.1:55432`

Scenario:
1. Start Docker PostgreSQL: `npm run staging:up`.
2. Apply migrations: `npm run staging:migrate`.
3. Start backend: `STAGING_SYNTHETIC_DATA_ONLY=true npm run staging:server`.
4. Optional frontend server: `npm run staging:frontend`.
5. Run synthetic E2E: `npm run staging:e2e:leads`.
6. Verify RU and INTERNATIONAL database isolation from E2E output.
7. Stop local services when finished.

The staging API requires `X-W1ZZYDEV-Synthetic-Test: true` when `STAGING_SYNTHETIC_DATA_ONLY=true`.
