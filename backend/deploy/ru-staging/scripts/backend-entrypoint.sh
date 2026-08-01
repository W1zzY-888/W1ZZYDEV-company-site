#!/bin/sh
set -eu

read_secret() {
  name="$1"
  file="$2"
  if [ ! -s "$file" ]; then
    echo "{\"level\":\"fatal\",\"operation\":\"secret.check\",\"secret\":\"$name\",\"status\":\"missing\"}" >&2
    exit 1
  fi
  value="$(cat "$file")"
  export "$name=$value"
}

read_secret RU_DATABASE_URL /run/secrets/ru_database_url
read_secret PUBLIC_TOKEN_HASH_SECRET /run/secrets/public_token_hash_secret
read_secret FIELD_ENCRYPTION_PROVIDER_CONFIG /run/secrets/field_encryption_provider_config

exec node deploy/ru-staging/scripts/ru-only-staging-server.js
