import http from 'node:http';
import { Application } from '../index.js';
import { PostgresDatabaseProvider } from '../database/providers/index.js';
import { PostgresLeadRepository, RegionLeadRepositoryResolver, TokenHasher, NoOpFieldEncryptionProvider } from '../api/v1/leads/index.js';
import { TOKENS } from '../core/tokens.js';
import { DockerPsqlClient } from './docker-psql-client.js';
import { assertNotProduction, STAGING_DATABASES } from './staging-utils.js';

assertNotProduction();

if (process.env.ALLOW_STAGING_SERVER_IN_PRODUCTION === 'true' && process.env.NODE_ENV === 'production') {
  throw new Error('Staging server explicit production bypass is forbidden in this entrypoint');
}

const app = new Application({ env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'staging', LEAD_API_ENABLED: 'true', NEW_BACKEND_ENABLED: 'true' } });
wireStagingPostgres(app);
const router = app.router();
const port = Number(process.env.STAGING_PORT || 8787);

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, {});
    if (req.url === '/health') return send(res, 200, { ok: true, status: 'live' });
    if (req.url === '/ready') {
      const components = await readiness();
      return send(res, components.every(item => item.status === 'ok' && item.migrationState === 'applied') ? 200 : 503, { ok: true, components });
    }
    if (process.env.STAGING_SYNTHETIC_DATA_ONLY === 'true' && req.headers['x-w1zzydev-synthetic-test'] !== 'true') {
      return send(res, 403, { ok: false, error: { code: 'SYNTHETIC_DATA_REQUIRED', message: 'Synthetic staging marker is required' } });
    }
    const route = routeFor(req.method, req.url || '');
    if (!route) return send(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
    const response = await router.resolve({ method: route.method, pathname: route.pathname }).handler({ body, params: route.params, metadata: { locale: body.locale || 'en-US' } });
    send(res, response.status, JSON.parse(response.body));
  } catch {
    send(res, 500, { ok: false, error: { code: 'STAGING_SERVER_ERROR', message: 'Staging request failed' } });
  }
});

server.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ message: 'staging.server.started', host: '127.0.0.1', port })));

function routeFor(method, url) {
  if (method === 'POST' && url === '/api/v1/leads') return { method, pathname: '/api/v1/leads', params: {} };
  const match = url.match(/^\/api\/v1\/leads\/([^/]+)$/);
  if (match && ['GET', 'PUT', 'DELETE'].includes(method)) return { method, pathname: '/api/v1/leads/{publicToken}', params: { publicToken: match[1] } };
  return null;
}

function send(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': allowedOrigin(),
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type,x-w1zzydev-request-id,x-w1zzydev-synthetic-test'
  });
  res.end(JSON.stringify(payload));
}

function allowedOrigin() {
  return process.env.STAGING_FRONTEND_ORIGIN || 'http://127.0.0.1:8080';
}

async function readiness() {
  return Promise.all(Object.entries(STAGING_DATABASES).map(async ([region, database]) => {
    const checkedAt = new Date().toISOString();
    const started = Date.now();
    try {
      const client = new DockerPsqlClient({ database });
      const health = await client.query("SELECT COUNT(*)::int AS applied_count FROM schema_migrations WHERE version IN ('20260729_001_leads', '20260729_002_lead_idempotency')", []);
      return {
        component: 'lead-postgres',
        region,
        status: 'ok',
        checkedAt,
        latencyBucket: bucket(Date.now() - started),
        migrationState: Number(health.rows[0]?.applied_count || 0) === 2 ? 'applied' : 'missing'
      };
    } catch {
      return { component: 'lead-postgres', region, status: 'unavailable', checkedAt, latencyBucket: 'unknown', migrationState: 'unknown' };
    }
  }));
}

function bucket(ms) {
  if (ms < 25) return 'lt_25ms';
  if (ms < 100) return 'lt_100ms';
  if (ms < 500) return 'lt_500ms';
  return 'gte_500ms';
}

function wireStagingPostgres(app) {
  const container = app.getContainer();
  const config = container.resolve(TOKENS.config);
  const secret = process.env.PUBLIC_TOKEN_HASH_SECRET || 'local-staging-synthetic-secret-000000';
  const tokenHasher = new TokenHasher({ secret, version: config.get('security.publicTokenHashVersion') });
  const encryptionProvider = new NoOpFieldEncryptionProvider({ environment: config.get('environment') });
  const repositories = Object.fromEntries(Object.entries(STAGING_DATABASES).map(([region, database]) => {
    const databaseProvider = new PostgresDatabaseProvider({
      region,
      config: { url: 'docker-compose-local', connectTimeoutMs: 3000, queryTimeoutMs: 5000 },
      client: new DockerPsqlClient({ database })
    });
    return [region, new PostgresLeadRepository({ databaseProvider, tokenHasher, encryptionProvider, region })];
  }));
  container.register(TOKENS.leadRepositoryResolver, () => new RegionLeadRepositoryResolver({ repositories }), { lifetime: 'singleton' });
}
