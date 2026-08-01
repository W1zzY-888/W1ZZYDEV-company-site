#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

if [ -z "${PREVIOUS_DEPLOYMENT_VERSION:-}" ]; then
  echo '{"level":"fatal","operation":"rollback.guard","errorCode":"PREVIOUS_DEPLOYMENT_VERSION_REQUIRED"}' >&2
  exit 1
fi

echo "{\"operation\":\"rollback.start\",\"region\":\"RU\",\"previousDeploymentVersion\":\"$PREVIOUS_DEPLOYMENT_VERSION\"}"
echo '{"operation":"rollback.database","status":"manual_review_required","destructiveRollback":"blocked"}'

docker compose up -d ru-postgres ru-backend reverse-proxy

for attempt in $(seq 1 20); do
  if docker compose exec -T ru-backend wget -qO- http://127.0.0.1:8787/health >/dev/null 2>&1; then
    echo "{\"operation\":\"rollback.complete\",\"region\":\"RU\",\"previousDeploymentVersion\":\"$PREVIOUS_DEPLOYMENT_VERSION\",\"status\":\"ok\"}"
    exit 0
  fi
  sleep 2
done

echo '{"level":"fatal","operation":"rollback.health","status":"failed"}' >&2
exit 1
