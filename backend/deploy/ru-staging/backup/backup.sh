#!/bin/sh
set -eu

if [ ! -s "${PGPASSWORD_FILE:-}" ] || [ ! -s /run/secrets/backup_encryption_secret ]; then
  echo '{"level":"fatal","operation":"backup.secret","status":"missing"}' >&2
  exit 1
fi

export PGPASSWORD="$(cat "$PGPASSWORD_FILE")"
secret_file=/run/secrets/backup_encryption_secret
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
out="/backup/out/ru-staging-${stamp}.dump.enc"
checksum="${out}.sha256"

pg_dump -Fc --no-owner --no-privileges | openssl enc -aes-256-cbc -pbkdf2 -salt -pass "file:${secret_file}" -out "$out"
sha256sum "$out" > "$checksum"

find /backup/out -name 'ru-staging-*.dump.enc' -mtime +"${BACKUP_RETENTION_DAYS:-14}" -delete
find /backup/out -name 'ru-staging-*.dump.enc.sha256' -mtime +"${BACKUP_RETENTION_DAYS:-14}" -delete

echo "{\"operation\":\"backup.complete\",\"region\":\"RU\",\"artifact\":\"$(basename "$out")\",\"checksum\":\"$(basename "$checksum")\"}"
