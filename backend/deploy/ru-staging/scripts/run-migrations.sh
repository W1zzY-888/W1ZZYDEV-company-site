#!/bin/sh
set -eu

if [ "${DEPLOYMENT_REGION:-}" != "RU" ]; then
  echo '{"level":"fatal","operation":"migration.guard","errorCode":"REGION_NOT_RU"}' >&2
  exit 1
fi

if [ ! -s "${PGPASSWORD_FILE:-}" ]; then
  echo '{"level":"fatal","operation":"migration.secret","errorCode":"POSTGRES_PASSWORD_MISSING"}' >&2
  exit 1
fi

export PGPASSWORD="$(cat "$PGPASSWORD_FILE")"

psql -v ON_ERROR_STOP=1 -X -q <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
SELECT pg_advisory_lock(hashtext('w1zzydev_ru_staging_migrations'));
SQL

apply_migration() {
  version="$1"
  file="$2"
  if psql -X -q -tAc "SELECT 1 FROM schema_migrations WHERE version='$version'" | grep -q 1; then
    echo "{\"operation\":\"migration.skip\",\"region\":\"RU\",\"migration\":\"$version\"}"
    return
  fi
  psql -v ON_ERROR_STOP=1 -X -q -f "$file"
  psql -v ON_ERROR_STOP=1 -X -q -c "INSERT INTO schema_migrations(version, applied_at) VALUES ('$version', now()) ON CONFLICT (version) DO NOTHING"
  echo "{\"operation\":\"migration.apply\",\"region\":\"RU\",\"migration\":\"$version\"}"
}

apply_migration 20260729_001_leads /migrations/20260729_001_leads.sql
apply_migration 20260729_002_lead_idempotency /migrations/20260729_002_lead_idempotency.sql

psql -v ON_ERROR_STOP=1 -X -q -c "SELECT pg_advisory_unlock(hashtext('w1zzydev_ru_staging_migrations'))"
echo '{"operation":"migration.complete","region":"RU","status":"ok"}'
