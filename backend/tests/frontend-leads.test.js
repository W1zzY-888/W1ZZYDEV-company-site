import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { assert, assertEqual, assertRejects } from '../api/v1/leads/tests/assert.js';

const api = await loadApi();
const sample = {
  name: 'Real User',
  contactType: 'email',
  contactValue: 'real@example.test',
  message: 'Real message',
  country: 'RU',
  consentId: 'consent',
  source: 'website',
  language: 'ru',
  clientRequestId: '11111111-1111-4111-8111-111111111111',
  metadata: { formId: 'project-form', page: '/contact/?secret=1', ignored: 'no' },
  legacyPayload: { submissionKey: 'legacy-ok' }
};

await test('legacy mode calls only legacy', async () => {
  let legacyCalls = 0;
  let fetchCalls = 0;
  const provider = api.createProvider({ legacySubmit: async () => (++legacyCalls, { submissionKey: 'legacy-ok' }), fetchImpl: async () => (++fetchCalls), config: api.readConfig() });
  const result = await provider.submit(sample);
  assertEqual(result.provider, 'legacy', 'legacy provider selected');
  assertEqual(legacyCalls, 1, 'legacy called once');
  assertEqual(fetchCalls, 0, 'new api not called');
});

await test('new_api mode calls only new API', async () => {
  let legacyCalls = 0;
  let fetchCalls = 0;
  const provider = api.createProvider({ legacySubmit: async () => (++legacyCalls), fetchImpl: async () => (++fetchCalls, okResponse()), config: api.readConfig({ FRONTEND_LEAD_SUBMISSION_MODE: 'new_api', LEAD_API_BASE_URL: 'http://127.0.0.1:8787' }) });
  const result = await provider.submit(sample);
  assertEqual(result.provider, 'new_api', 'new api provider selected');
  assertEqual(legacyCalls, 0, 'legacy not called');
  assertEqual(fetchCalls, 1, 'new api called');
});

await test('shadow mode sends synthetic payload after legacy', async () => {
  const bodies = [];
  const provider = api.createProvider({ legacySubmit: async () => ({ submissionKey: 'legacy-ok' }), fetchImpl: async (_url, options) => (bodies.push(JSON.parse(options.body)), okResponse()), config: api.readConfig({ FRONTEND_LEAD_SUBMISSION_MODE: 'shadow', ALLOW_FRONTEND_SHADOW_MODE: 'true', LEAD_API_BASE_URL: 'http://127.0.0.1:8787', LEAD_API_SYNTHETIC_HEADER_ENABLED: 'true' }) });
  await provider.submit(sample);
  await wait();
  assertEqual(bodies[0].name, 'Shadow Test User', 'shadow name synthetic');
  assertEqual(bodies[0].contactValue, 'shadow-test@example.invalid', 'shadow contact synthetic');
  assertEqual(bodies[0].message, 'Synthetic shadow submission', 'shadow message synthetic');
});

await test('legacy failure does not start shadow', async () => {
  let fetchCalls = 0;
  const provider = api.createProvider({ legacySubmit: async () => { throw new Error('legacy failed'); }, fetchImpl: async () => (++fetchCalls, okResponse()), config: api.readConfig({ FRONTEND_LEAD_SUBMISSION_MODE: 'shadow', ALLOW_FRONTEND_SHADOW_MODE: 'true', LEAD_API_BASE_URL: 'http://127.0.0.1:8787' }) });
  await assertRejects(() => provider.submit(sample), 'legacy failure rejects');
  assertEqual(fetchCalls, 0, 'shadow not called after legacy failure');
});

await test('unsafe fields are stripped', async () => {
  const payload = api.toLeadApiPayload({ ...sample, routeRegion: 'RU', id: 'internal', metadata: { page: '/x?token=1', formId: 'f', cookie: 'secret' } });
  assert(!('routeRegion' in payload), 'routeRegion not sent');
  assert(!('id' in payload), 'internal id not sent');
  assertEqual(payload.metadata.page, '/x', 'query string stripped');
  assert(!('cookie' in payload.metadata), 'metadata allowlist enforced');
});

await test('logs redact PII and public token', async () => {
  const safe = api.safeLogPayload({ contactValue: 'real@example.test', message: 'hello', publicToken: 'lead_secret', requestId: 'req', statusCode: 503 });
  assert(!JSON.stringify(safe).includes('real@example.test'), 'contactValue redacted');
  assert(!JSON.stringify(safe).includes('lead_secret'), 'publicToken redacted');
  assertEqual(safe.requestId, 'req', 'safe request id kept');
});

await test('invalid mode falls back to legacy default', async () => {
  assertEqual(api.readConfig({ FRONTEND_LEAD_SUBMISSION_MODE: 'bad' }).mode, 'legacy', 'invalid mode fallback');
});

await test('production safety rejects localhost and synthetic header', async () => {
  await assertRejects(async () => api.createProvider({ legacySubmit: async () => ({}), config: api.readConfig({ NODE_ENV: 'production', FRONTEND_LEAD_SUBMISSION_MODE: 'new_api', LEAD_API_BASE_URL: 'http://127.0.0.1:8787' }) }), 'localhost forbidden');
  await assertRejects(async () => api.createProvider({ legacySubmit: async () => ({}), config: api.readConfig({ NODE_ENV: 'production', LEAD_API_SYNTHETIC_HEADER_ENABLED: 'true' }) }), 'synthetic header forbidden');
});

await test('timeout and malformed response are mapped', async () => {
  const timeout = api.mapLeadSubmissionError({ code: 'TIMEOUT' });
  assertEqual(timeout.state, 'temporary_error', 'timeout temporary');
  const malformedProvider = api.createProvider({ legacySubmit: async () => ({}), fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new Error('bad json'); } }), config: api.readConfig({ FRONTEND_LEAD_SUBMISSION_MODE: 'new_api', LEAD_API_BASE_URL: 'http://127.0.0.1:8787' }) });
  await assertRejects(() => malformedProvider.submit(sample), 'malformed json rejected');
});

await test('double submit guard blocks concurrent duplicate', async () => {
  let release;
  const first = new Promise(resolve => { release = resolve; });
  const provider = api.createProvider({ legacySubmit: async () => (await first, { submissionKey: 'ok' }) });
  const pending = provider.submit(sample);
  const duplicate = await provider.submit(sample);
  release();
  await pending;
  assertEqual(duplicate.state, 'submitting', 'duplicate submit blocked');
});

console.log('frontend-leads.test: ok');

async function loadApi() {
  const code = await readFile(new URL('../../assets/js/lead-submission.js', import.meta.url), 'utf8');
  const sandbox = {
    window: {
      W1ZZYDEV_LEAD_CONFIG: {},
      crypto: { randomUUID: () => '22222222-2222-4222-8222-222222222222' },
      fetch: async () => okResponse(),
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

function okResponse() {
  return { ok: true, status: 201, json: async () => ({ ok: true, data: { publicToken: 'lead_masked' } }) };
}

async function test(name, fn) {
  await fn();
}

function wait() {
  return new Promise(resolve => setTimeout(resolve, 10));
}
