import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('deploy/ru-staging');
const env = await readFile(resolve(root, '.env.example'), 'utf8');
const compose = await readFile(resolve(root, 'docker-compose.yml'), 'utf8');

const requiredEnv = [
  'NODE_ENV=staging',
  'DEPLOYMENT_REGION=RU',
  'RU_API_DOMAIN=ru-api-staging.example.com',
  'LEAD_API_ENABLED=true',
  'NEW_BACKEND_ENABLED=true',
  'RU_DATABASE_MODE=postgres',
  'INTERNATIONAL_DATABASE_MODE=disabled',
  'STAGING_SYNTHETIC_DATA_ONLY=true',
  'FIELD_ENCRYPTION_MODE=external_kms'
];

const checks = requiredEnv.map(item => [`env:${item}`, env.includes(item)]);
checks.push(['secrets contract', ['ru_database_url', 'ru_postgres_password', 'public_token_hash_secret', 'field_encryption_provider_config', 'backup_encryption_secret'].every(item => compose.includes(item))]);
checks.push(['no secret values in env example', !/(password|secret|key)=.+[A-Za-z0-9]{12,}/i.test(env)]);
checks.push(['domain placeholder only', env.includes('ru-api-staging.example.com')]);

for (const [name, ok] of checks) console.log(JSON.stringify({ operation: 'deploy.ru.config', name, ok }));
if (checks.some(([, ok]) => !ok)) throw new Error('RU config check failed');
