const baseUrl = process.env.STAGING_BASE_URL || 'http://127.0.0.1:8787';
const headers = { 'content-type': 'application/json', 'x-w1zzydev-synthetic-test': 'true' };

const fixtures = [
  { label: 'RU', selectedCountry: 'Russia', serverCountryCode: 'US', phone: '+70000000000', locale: 'ru-RU', name: 'Test User RU', contactType: 'EMAIL', contactValue: 'test-ru@example.invalid', message: 'Synthetic staging request', consentId: 'synthetic-consent-ru', source: 'TEST', language: 'ru', metadata: { formId: 'staging-smoke', page: 'lead' } },
  { label: 'INTERNATIONAL', selectedCountry: 'US', serverCountryCode: 'US', phone: '+12025550100', locale: 'en-US', name: 'Test User US', contactType: 'EMAIL', contactValue: 'test-us@example.invalid', message: 'Synthetic staging request', consentId: 'synthetic-consent-us', source: 'TEST', language: 'en', metadata: { formId: 'staging-smoke', page: 'lead' } }
];

for (const fixture of fixtures) {
  const { label, ...body } = fixture;
  const created = await request('/api/v1/leads', { method: 'POST', body });
  const token = created.data?.publicToken;
  await request(`/api/v1/leads/${encodeURIComponent(token)}`, { method: 'GET' });
  await request(`/api/v1/leads/${encodeURIComponent(token)}`, { method: 'PUT', body: { status: 'IN_PROGRESS' } });
  await request(`/api/v1/leads/${encodeURIComponent(token)}`, { method: 'DELETE' });
  const deletedLookup = await fetch(`${baseUrl}/api/v1/leads/${encodeURIComponent(token)}`, { headers });
  console.log(JSON.stringify({ result: 'smoke.complete', region: label, tokenPrefix: `${token.slice(0, 10)}...`, deletedLookupStatus: deletedLookup.status }));
}

async function request(path, { method, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new Error(`Smoke request failed: ${method} ${path} ${response.status}`);
  return data;
}
