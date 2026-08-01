import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { psql, STAGING_DATABASES, assertNotProduction, safeStatus } from './staging-utils.js';

assertNotProduction();

const api = await loadFrontendApi();
const baseUrl = process.env.LEAD_API_BASE_URL || 'http://127.0.0.1:8787';

await verifyReady();
await submitNewApiScenario('RU', 'RU', STAGING_DATABASES.RU, STAGING_DATABASES.INTERNATIONAL);
await submitNewApiScenario('INTERNATIONAL', 'US', STAGING_DATABASES.INTERNATIONAL, STAGING_DATABASES.RU);
await submitShadowScenario();

safeStatus('frontend.leads.e2e.ok', { status: 'ok' });

async function submitNewApiScenario(regionLabel, country, expectedDb, otherDb) {
  const marker = `frontend-e2e-${regionLabel.toLowerCase()}-${Date.now()}`;
  const payload = syntheticPayload({ country, source: marker });
  const provider = api.createProvider({
    legacySubmit: async () => { throw new Error('legacy must not run'); },
    fetchImpl: fetch,
    config: api.readConfig({ FRONTEND_LEAD_SUBMISSION_MODE: 'new_api', LEAD_API_BASE_URL: baseUrl, LEAD_API_SYNTHETIC_HEADER_ENABLED: 'true' })
  });
  const result = await provider.submit(payload);
  if (!result.ok) throw new Error(`${regionLabel} frontend submit failed`);
  const expected = await countBySource(expectedDb, marker);
  const other = await countBySource(otherDb, marker);
  if (expected !== 1 || other !== 0) throw new Error(`${regionLabel} region isolation failed`);
  await verifyIdempotency(expectedDb, payload);
  safeStatus('frontend.leads.e2e.region.ok', { region: regionLabel, expected, other });
}

async function submitShadowScenario() {
  const marker = `frontend-e2e-shadow-${Date.now()}`;
  const payload = syntheticPayload({ country: 'US', source: marker });
  let legacyCalls = 0;
  const provider = api.createProvider({
    legacySubmit: async () => (++legacyCalls, { submissionKey: 'legacy-shadow-ok' }),
    fetchImpl: fetch,
    config: api.readConfig({ FRONTEND_LEAD_SUBMISSION_MODE: 'shadow', ALLOW_FRONTEND_SHADOW_MODE: 'true', LEAD_API_BASE_URL: baseUrl, LEAD_API_SYNTHETIC_HEADER_ENABLED: 'true' })
  });
  const result = await provider.submit(payload);
  await new Promise(resolve => setTimeout(resolve, 200));
  if (result.provider !== 'legacy' || legacyCalls !== 1) throw new Error('shadow legacy result failed');
  const shadowRows = await psql(STAGING_DATABASES.INTERNATIONAL, "SELECT COUNT(*)::int FROM leads WHERE source='frontend-shadow' AND contact_value='shadow-test@example.invalid' AND message='Synthetic shadow submission'");
  if (!shadowRows.stdout.match(/\b[1-9][0-9]*\b/)) throw new Error('shadow synthetic row missing');
  const piiRows = await psql(STAGING_DATABASES.INTERNATIONAL, `SELECT COUNT(*)::int FROM leads WHERE source='frontend-shadow' AND (name='${payload.name}' OR contact_value='${payload.contactValue}' OR message='${payload.message}')`);
  if (!piiRows.stdout.match(/\b0\b/)) throw new Error('shadow leaked original payload');
  safeStatus('frontend.leads.e2e.shadow.ok', { legacyCalls, synthetic: true });
}

async function verifyIdempotency(database, payload) {
  const before = await countBySource(database, payload.source);
  const provider = api.createProvider({
    legacySubmit: async () => { throw new Error('legacy must not run'); },
    fetchImpl: fetch,
    config: api.readConfig({ FRONTEND_LEAD_SUBMISSION_MODE: 'new_api', LEAD_API_BASE_URL: baseUrl, LEAD_API_SYNTHETIC_HEADER_ENABLED: 'true' })
  });
  await provider.submit(payload);
  const after = await countBySource(database, payload.source);
  if (before !== after) throw new Error('idempotency duplicate detected');
}

function syntheticPayload(overrides = {}) {
  return {
    name: 'Synthetic Frontend User',
    contactType: 'email',
    contactValue: 'frontend-synthetic@example.invalid',
    message: 'Synthetic frontend-to-backend staging lead',
    country: overrides.country || 'US',
    consentId: 'synthetic-consent',
    source: overrides.source || 'frontend-e2e',
    language: 'en',
    clientRequestId: crypto.randomUUID(),
    metadata: { formId: 'e2e', page: '/contact/?secret=1' }
  };
}

async function verifyReady() {
  const response = await fetch(`${baseUrl}/ready`);
  if (!response.ok) throw new Error('staging server is not ready');
}

async function countBySource(database, source) {
  const escaped = source.replace(/'/g, "''");
  const { stdout } = await psql(database, `SELECT COUNT(*)::int FROM leads WHERE source='${escaped}'`);
  const match = stdout.match(/\b([0-9]+)\b/);
  return Number(match?.[1] || 0);
}

async function loadFrontendApi() {
  const code = await readFile(new URL('../../assets/js/lead-submission.js', import.meta.url), 'utf8');
  const sandbox = {
    window: {
      W1ZZYDEV_LEAD_CONFIG: {},
      crypto,
      fetch,
      location: { hostname: 'localhost', pathname: '/contact/' },
      console
    },
    setTimeout,
    clearTimeout,
    AbortController
  };
  vm.runInNewContext(code, sandbox);
  return sandbox.window.W1ZZYDEVLeadSubmission;
}
