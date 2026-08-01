# Staging Operations

Useful commands:

- `npm run staging:up`
- `npm run staging:down`
- `npm run staging:reset`
- `npm run staging:migrate`
- `npm run staging:server`
- `npm run staging:smoke`
- `npm run test:postgres`
- `npm run test:all`

Reset is forbidden in production by script guard. Migrations are not applied automatically. PostgreSQL is bound to localhost only in Docker Compose.
