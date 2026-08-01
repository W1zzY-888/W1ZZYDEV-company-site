#!/bin/sh
set -eu

if [ "${DEPLOYMENT_REGION:-}" != "RU" ] || [ "${RESTORE_CONFIRM:-}" != "RU_STAGING_SYNTHETIC_RESTORE" ]; then
  echo '{"level":"fatal","operation":"restore.guard","status":"blocked"}' >&2
  exit 1
fi

if [ "${RESTORE_SOURCE_ENVIRONMENT:-staging}" = "production" ] && [ "${RESTORE_SANITIZED:-false}" != "true" ]; then
  echo '{"level":"fatal","operation":"restore.guard","errorCode":"PRODUCTION_RESTORE_REQUIRES_SANITIZATION"}' >&2
  exit 1
fi

artifact="${1:-}"
if [ ! -s "$artifact" ]; then
  echo '{"level":"fatal","operation":"restore.input","status":"missing_artifact"}' >&2
  exit 1
fi

export PGPASSWORD="$(cat "$PGPASSWORD_FILE")"
openssl enc -d -aes-256-cbc -pbkdf2 -pass "file:/run/secrets/backup_encryption_secret" -in "$artifact" | pg_restore --clean --if-exists --no-owner --no-privileges -d "$PGDATABASE"
echo '{"operation":"restore.complete","region":"RU","status":"ok"}'
