import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('deploy/ru-staging');
const compose = await readFile(resolve(root, 'docker-compose.yml'), 'utf8');
const server = await readFile(resolve(root, 'scripts/ru-only-staging-server.js'), 'utf8');

const checks = {
  noopEncryptionForbidden: server.includes("FIELD_ENCRYPTION_MODE === 'noop_test_only'"),
  missingEncryptionBlocksStartup: server.includes('Production-like field encryption provider is required'),
  tokenHashSecretRequired: server.includes("requiredEnv('PUBLIC_TOKEN_HASH_SECRET')"),
  requestBodyNotLogged: !server.includes('body:') && !server.includes('request.body'),
  publicTokenNotLogged: !server.match(/console\.[a-z]+\([^)]*publicToken/) && !server.match(/process\.stdout\.write\([^)]*publicToken/),
  dbUrlNotLogged: !server.includes('RU_DATABASE_URL,'),
  syntheticHeaderRequired: server.includes('SYNTHETIC_DATA_REQUIRED'),
  productionSyntheticBypassForbidden: server.includes("NODE_ENV === 'production'"),
  rateLimitReturns429: server.includes('429') && server.includes('retry-after'),
  noPrivileged: !compose.includes('privileged: true'),
  noDockerSocket: !compose.includes('/var/run/docker.sock'),
  postgresNotPublic: !serviceBlock(compose, 'ru-postgres').includes('\n    ports:'),
  backendNotPublic: !serviceBlock(compose, 'ru-backend').includes('\n    ports:')
};

for (const [name, ok] of Object.entries(checks)) console.log(JSON.stringify({ operation: 'deploy.ru.security', name, ok }));
if (Object.values(checks).some(ok => !ok)) throw new Error('RU security check failed');

function serviceBlock(source, name) {
  const start = source.indexOf(`  ${name}:`);
  if (start === -1) return '';
  const rest = source.slice(start + 1);
  const next = rest.search(/\n  [a-zA-Z0-9_-]+:/);
  return next === -1 ? rest : rest.slice(0, next);
}
