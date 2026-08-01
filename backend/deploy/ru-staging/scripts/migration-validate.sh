#!/bin/sh
set -eu

required="20260729_001_leads 20260729_002_lead_idempotency"
export PGPASSWORD="$(cat "$PGPASSWORD_FILE")"
for version in $required; do
  if ! psql -X -q -tAc "SELECT 1 FROM schema_migrations WHERE version='$version'" | grep -q 1; then
    echo "{\"operation\":\"migration.validate\",\"region\":\"RU\",\"migration\":\"$version\",\"status\":\"missing\"}" >&2
    exit 1
  fi
done
echo '{"operation":"migration.validate","region":"RU","status":"ok"}'
