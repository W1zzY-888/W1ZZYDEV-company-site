import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const compose = await readFile(resolve('deploy/ru-staging/docker-compose.yml'), 'utf8');
const nginx = await readFile(resolve('deploy/ru-staging/nginx/conf.d/ru-api.conf'), 'utf8');

const checks = [
  ['RU route accepted by contract', nginx.includes('location = /api/v1/leads')],
  ['INTERNATIONAL provider disabled', compose.includes('INTERNATIONAL_DATABASE_MODE: disabled')],
  ['No cross-region fallback', !compose.includes('INTERNATIONAL_DATABASE_URL')],
  ['PostgreSQL not host-published', !/ru-postgres:[\\s\\S]*?ports:/m.test(compose)],
  ['Backend not host-published', !/ru-backend:[\\s\\S]*?ports:/m.test(compose)],
  ['Reverse proxy exposes health', nginx.includes('location = /health')],
  ['Reverse proxy exposes ready', nginx.includes('location = /ready')],
  ['Internal preview blocked', nginx.includes('api/v1/routing-preview')],
  ['Synthetic guard configured', compose.includes('STAGING_SYNTHETIC_DATA_ONLY: "true"')]
];

for (const [name, ok] of checks) console.log(JSON.stringify({ operation: 'deploy.ru.smoke', name, ok }));
if (checks.some(([, ok]) => !ok)) throw new Error('RU local deployment smoke failed');
console.log(JSON.stringify({ operation: 'deploy.ru.smoke', status: 'ok', mode: 'prepared-package' }));
