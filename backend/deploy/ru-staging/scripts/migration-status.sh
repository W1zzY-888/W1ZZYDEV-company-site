#!/bin/sh
set -eu

export PGPASSWORD="$(cat "$PGPASSWORD_FILE")"
psql -X -q -tAc "SELECT version || ':' || 'applied' FROM schema_migrations ORDER BY version"
