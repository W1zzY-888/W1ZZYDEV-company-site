# PostgreSQL Integration Tests

Command:

```bash
RUN_POSTGRES_INTEGRATION_TESTS=true npm run test:postgres
```

If the flag is not set, tests skip with an explicit message. If the flag is set and PostgreSQL/Docker is unavailable, the command must fail.

The tests are intended to:

- verify both staging databases are reachable;
- apply migrations;
- clean test data only;
- run repository checks;
- verify region isolation;
- close connections.

No production database may be used.
