#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

if [ "${NODE_ENV:-staging}" = "production" ]; then
  echo '{"level":"fatal","operation":"deploy.guard","errorCode":"PRODUCTION_NODE_ENV_FORBIDDEN"}' >&2
  exit 1
fi

command -v docker >/dev/null 2>&1 || { echo '{"level":"fatal","operation":"deploy.docker","status":"missing"}' >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo '{"level":"fatal","operation":"deploy.compose","status":"missing"}' >&2; exit 1; }

node scripts/validate-secrets.js
node scripts/validate-ru-deployment.js

DEPLOYMENT_VERSION="${DEPLOYMENT_VERSION:-$(date -u +%Y%m%dT%H%M%SZ)}"
export DEPLOYMENT_VERSION
echo "{\"operation\":\"deploy.start\",\"region\":\"RU\",\"deploymentVersion\":\"$DEPLOYMENT_VERSION\"}"

docker compose --profile backup run --rm backup || {
  echo '{"level":"fatal","operation":"deploy.backup","status":"failed"}' >&2
  exit 1
}

docker compose build ru-backend
docker compose run --rm migration
docker compose up -d ru-postgres ru-backend reverse-proxy

for attempt in $(seq 1 30); do
  if docker compose exec -T ru-backend wget -qO- http://127.0.0.1:8787/health >/dev/null 2>&1; then
    node scripts/local-smoke.js
    echo "{\"operation\":\"deploy.complete\",\"region\":\"RU\",\"deploymentVersion\":\"$DEPLOYMENT_VERSION\",\"status\":\"ok\"}"
    exit 0
  fi
  sleep 2
done

echo '{"level":"error","operation":"deploy.health","status":"failed"}' >&2
sh scripts/rollback-ru-staging.sh || true
exit 1
