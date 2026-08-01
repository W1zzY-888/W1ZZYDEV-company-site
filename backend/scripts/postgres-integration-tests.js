import { resolve } from 'node:path';
import { requirePostgresIntegration, psql, safeStatus, STAGING_DATABASES } from './staging-utils.js';

if (!requirePostgresIntegration()) process.exit(0);

for (const [region, database] of Object.entries(STAGING_DATABASES)) {
  await psql(database, 'SELECT 1');
  safeStatus('postgres.available', { region });
}

await import('./staging-db.js');

for (const [region, database] of Object.entries(STAGING_DATABASES)) {
  await psql(database, 'DELETE FROM leads');
  await psql(database, "INSERT INTO leads(public_token_hash, region, country, name, contact_type, contact_value, message, status, consent_id, source, language, routing_policy_version, routing_reason, routing_confidence) VALUES ('v1:synthetic-hash', '" + region + "', 'Synthetic', 'Test User', 'EMAIL', 'test@example.invalid', 'Synthetic staging request', 'NEW', 'consent-test', 'TEST', 'en', '2026-07-v1', 'GLOBAL_DEFAULT', 'LOW')");
  const { stdout } = await psql(database, "SELECT region,status FROM leads WHERE public_token_hash='v1:synthetic-hash'");
  if (!stdout.includes(region) || !stdout.includes('NEW')) throw new Error(`Postgres integration failed for ${region}`);
  await psql(database, 'DELETE FROM leads');
  safeStatus('postgres.integration.checked', { region });
}

safeStatus('postgres.integration.complete', { migrationValidation: resolve('database/tests/migration-validation.test.js') });
