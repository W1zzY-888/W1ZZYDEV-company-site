# RU Staging Database

PostgreSQL is private to Docker internal network.

Settings:
- database: `w1zzydev_ru_staging`
- user: `w1zzydev_ru_app`
- UTF-8 initialization
- UTC timezone
- no host port
- persistent Docker volume
- connection and statement timeouts
- migration history table

Migrations:
- `20260729_001_leads`
- `20260729_002_lead_idempotency`

Migration job uses `pg_advisory_lock` to avoid concurrent execution. Reset/destructive migration is not included in the deployment profile.
