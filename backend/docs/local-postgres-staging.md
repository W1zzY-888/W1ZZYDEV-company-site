# Local PostgreSQL Staging

This is local backend-only staging. It is not Russian production infrastructure and does not prove geographic localization.

## Steps

1. Copy `backend/.env.staging.example` to a local untracked env file and replace test-only secrets.
2. Start Docker PostgreSQL:
   ```bash
   npm run staging:up
   ```
3. Apply migrations:
   ```bash
   npm run staging:migrate
   ```
4. Check status:
   ```bash
   npm run db:staging:status
   ```
5. Start backend-only staging server:
   ```bash
   npm run staging:server
   ```
6. Run smoke:
   ```bash
   npm run staging:smoke
   ```
7. Stop:
   ```bash
   npm run staging:down
   ```

Use only synthetic data.
