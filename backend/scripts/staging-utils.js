import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function assertNotProduction(env = process.env) {
  if (env.NODE_ENV === 'production') throw new Error('Staging operation is forbidden in production');
}

export function requirePostgresIntegration(env = process.env) {
  if (env.RUN_POSTGRES_INTEGRATION_TESTS !== 'true') {
    console.log('postgres-integration: skipped because RUN_POSTGRES_INTEGRATION_TESTS is not true');
    return false;
  }
  return true;
}

export async function dockerCompose(args, options = {}) {
  return execFileAsync('docker', ['compose', '-f', 'docker-compose.staging.yml', ...args], {
    cwd: options.cwd || new URL('..', import.meta.url).pathname,
    env: process.env,
    maxBuffer: 1024 * 1024
  });
}

export async function psql(database, sql) {
  return dockerCompose(['exec', '-T', 'postgres', 'psql', '-U', 'w1zzydev_staging', '-d', database, '-v', 'ON_ERROR_STOP=1', '-X', '-q', '-c', sql]);
}

export async function psqlFile(database, filePath) {
  const sql = await readFile(filePath, 'utf8');
  return psql(database, sql);
}

export const STAGING_DATABASES = Object.freeze({
  RU: 'w1zzydev_ru_staging',
  INTERNATIONAL: 'w1zzydev_international_staging'
});

export function safeStatus(message, details = {}) {
  console.log(JSON.stringify({ message, ...details }));
}
