import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sql = await readFile(resolve('database/migrations/20260729_001_leads.sql'), 'utf8');
const idempotencySql = await readFile(resolve('database/migrations/20260729_002_lead_idempotency.sql'), 'utf8');
const required = [
  'CREATE TABLE IF NOT EXISTS leads',
  'public_token_hash text NOT NULL',
  "CHECK (region IN ('RU', 'INTERNATIONAL'))",
  "CHECK (status IN ('NEW', 'IN_PROGRESS', 'WAITING_CLIENT', 'COMPLETED', 'CLOSED'))",
  'leads_public_token_hash_uidx',
  'leads_region_idx',
  'leads_status_idx',
  'leads_created_at_idx',
  'prevent_leads_region_update',
  'leads_region_immutable'
];

for (const item of required) {
  if (!sql.includes(item)) throw new Error(`Migration validation failed: missing ${item}`);
}

for (const item of ['client_request_id text', 'leads_region_client_request_id_uidx', 'ON leads(region, client_request_id)']) {
  if (!idempotencySql.includes(item)) throw new Error(`Idempotency migration validation failed: missing ${item}`);
}

console.log('migration-validation.test: ok');
