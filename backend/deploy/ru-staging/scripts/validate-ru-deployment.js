import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('deploy/ru-staging');
const compose = await text('docker-compose.yml');
const nginx = await text('nginx/conf.d/ru-api.conf');
const nginxMain = await text('nginx/nginx.conf');
const envExample = await text('.env.example');
const checks = [];

check('compose has ru-backend', compose.includes('ru-backend:'));
check('compose has ru-postgres', compose.includes('ru-postgres:'));
check('compose has reverse-proxy', compose.includes('reverse-proxy:'));
check('compose has migration job', compose.includes('migration:'));
check('international db disabled', compose.includes('INTERNATIONAL_DATABASE_MODE: disabled') && envExample.includes('INTERNATIONAL_DATABASE_MODE=disabled'));
check('postgres not public', !serviceBlock(compose, 'ru-postgres').includes('\n    ports:'));
check('backend not directly public', !serviceBlock(compose, 'ru-backend').includes('\n    ports:'));
check('internal network declared', compose.includes('internal: true'));
check('non-root backend', compose.includes('user: "10001:10001"'));
check('no privileged flag', !compose.includes('privileged: true'));
check('no docker socket', !compose.includes('/var/run/docker.sock'));
check('pinned postgres image', compose.includes('postgres:16.6-alpine'));
check('pinned nginx image', compose.includes('nginx:1.27.3-alpine'));
check('read only backend', /ru-backend:[\s\S]*?read_only: true/m.test(compose));
check('capabilities dropped', compose.includes('cap_drop:'));
check('log rotation configured', compose.includes('max-size: "10m"'));
check('secret files referenced', compose.includes('public_token_hash_secret') && compose.includes('backup_encryption_secret'));
check('env example keeps legacy frontend out of production switch', !envExample.includes('FRONTEND_LEAD_SUBMISSION_MODE=new_api'));
check('nginx tls ready', nginx.includes('ssl_protocols TLSv1.2 TLSv1.3'));
check('http redirects to https', nginx.includes('return 301 https://$host$request_uri'));
check('allowed routes only', nginx.includes('location = /api/v1/leads') && nginx.includes('return 404'));
check('internal endpoints blocked', nginx.includes('api/v1/routing-preview') && nginx.includes('debug'));
check('request body limit', nginxMain.includes('client_max_body_size 32k'));
check('rate limiting configured', nginxMain.includes('limit_req_zone') && nginx.includes('limit_req zone=lead_api'));
check('no wildcard cors', !nginx.includes('Access-Control-Allow-Origin *') && nginxMain.includes('map $http_origin $cors_origin'));
check('request id propagation', nginx.includes('X-W1ZZYDEV-Request-Id'));
check('migration lock', (await text('scripts/run-migrations.sh')).includes('pg_advisory_lock'));
check('backup encrypted', (await text('backup/backup.sh')).includes('openssl enc'));
check('restore confirmation', (await text('backup/restore.sh')).includes('RU_STAGING_SYNTHETIC_RESTORE'));
check('rollback validates previous version', (await text('scripts/rollback-ru-staging.sh')).includes('PREVIOUS_DEPLOYMENT_VERSION'));
check('deploy script checks secrets', (await text('scripts/deploy-ru-staging.sh')).includes('validate-secrets.js'));

for (const file of ['secrets/ru_postgres_password.txt', 'secrets/ru_database_url.txt', 'secrets/public_token_hash_secret.txt', 'secrets/field_encryption_provider_config.json', 'secrets/backup_encryption_secret.txt']) {
  try {
    await access(resolve(root, file), constants.F_OK);
    check(`secret absent ${file}`, false);
  } catch {
    check(`secret absent ${file}`, true);
  }
}

const failed = checks.filter(item => !item.ok);
for (const item of checks) console.log(JSON.stringify(item));
if (failed.length) throw new Error(`RU deployment validation failed: ${failed.map(item => item.name).join(', ')}`);
console.log(JSON.stringify({ operation: 'deploy.ru.validate', status: 'ok', checks: checks.length }));

async function text(path) {
  return readFile(resolve(root, path), 'utf8');
}

function check(name, ok) {
  checks.push({ operation: 'deploy.ru.check', name, ok: Boolean(ok) });
}

function serviceBlock(source, name) {
  const start = source.indexOf(`  ${name}:`);
  if (start === -1) return '';
  const rest = source.slice(start + 1);
  const next = rest.search(/\n  [a-zA-Z0-9_-]+:/);
  return next === -1 ? rest : rest.slice(0, next);
}
