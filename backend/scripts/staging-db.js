import { resolve } from 'node:path';
import { assertNotProduction, psql, psqlFile, safeStatus, STAGING_DATABASES } from './staging-utils.js';

const action = process.argv[2] || 'status';
const migrations = [
  { version: '20260729_001_leads', file: resolve('database/migrations/20260729_001_leads.sql'), downFile: resolve('database/migrations/20260729_001_leads.down.sql') },
  { version: '20260729_002_lead_idempotency', file: resolve('database/migrations/20260729_002_lead_idempotency.sql') }
];

assertNotProduction();

if (action === 'migrate') await runForEachDatabase(migrate);
else if (action === 'status') await runForEachDatabase(status);
else if (action === 'reset') await runForEachDatabase(reset);
else throw new Error(`Unknown staging-db action: ${action}`);

async function migrate(region, database) {
  await ensureHistory(database);
  for (const migration of migrations) {
    const applied = await isApplied(database, migration.version);
    if (!applied) {
      await psqlFile(database, migration.file);
      await psql(database, `INSERT INTO schema_migrations(version, applied_at) VALUES ('${migration.version}', now()) ON CONFLICT (version) DO NOTHING`);
    }
    safeStatus('migration.checked', { region, migration: migration.version, applied: true });
  }
}

async function status(region, database) {
  await ensureHistory(database);
  for (const migration of migrations) {
    const applied = await isApplied(database, migration.version);
    safeStatus('migration.status', { region, migration: migration.version, applied });
  }
}

async function reset(region, database) {
  await psqlFile(database, migrations[0].downFile);
  await psql(database, 'DROP TABLE IF EXISTS schema_migrations');
  safeStatus('migration.reset', { region });
}

async function ensureHistory(database) {
  await psql(database, 'CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
}

async function isApplied(database, version) {
  const { stdout } = await psql(database, `SELECT version FROM schema_migrations WHERE version='${version}'`);
  return stdout.includes(version);
}

async function runForEachDatabase(fn) {
  for (const [region, database] of Object.entries(STAGING_DATABASES)) {
    await fn(region, database);
  }
}
