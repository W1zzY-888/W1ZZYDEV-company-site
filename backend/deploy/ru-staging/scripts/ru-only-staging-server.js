import http from 'node:http';
import { Application } from '../../../index.js';
import { PostgresDatabaseProvider } from '../../../database/providers/index.js';
import { PostgresLeadRepository, RegionLeadRepositoryResolver, TokenHasher, ExternalKmsFieldEncryptionProvider } from '../../../api/v1/leads/index.js';
import { TOKENS } from '../../../core/tokens.js';
import { InfrastructureError } from '../../../core/errors.js';

assertRuStagingEnvironment();

const app = new Application({
  env: {
    ...process.env,
    NODE_ENV: 'staging',
    DEPLOYMENT_REGION: 'RU',
    LEAD_API_ENABLED: 'true',
    NEW_BACKEND_ENABLED: 'true',
    RU_DATABASE_MODE: 'postgres',
    INTERNATIONAL_DATABASE_MODE: 'disabled',
    STAGING_SYNTHETIC_DATA_ONLY: 'true'
  }
});

wireRuOnlyPostgres(app);
wireRuOnlyRouting(app);

const router = app.router();
const port = Number(process.env.PORT || 8787);
const allowedOrigins = new Set(String(process.env.CORS_ALLOWED_ORIGINS || '').split(',').map(item => item.trim()).filter(Boolean));
const rateLimit = new Map();

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  try {
    if (req.method === 'OPTIONS') return send(res, 204, {}, req);
    if (req.url === '/health') return send(res, 200, { ok: true, status: 'live' }, req);
    if (req.url === '/ready') return send(res, await readyStatus(), await readiness(), req);
    if (!isAllowedPath(req.method, req.url || '')) return send(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }, req);
    if (process.env.STAGING_SYNTHETIC_DATA_ONLY === 'true' && req.headers['x-w1zzydev-synthetic-test'] !== 'true') {
      return send(res, 403, { ok: false, error: { code: 'SYNTHETIC_DATA_REQUIRED', message: 'Synthetic staging marker is required' } }, req);
    }
    const limited = checkRateLimit(req);
    if (limited) return send(res, 429, { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, req, { 'retry-after': '60' });
    const route = routeFor(req.method, req.url || '');
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 32 * 1024) return send(res, 413, { ok: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Payload is too large' } }, req);
    }
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
    const response = await router.resolve({ method: route.method, pathname: route.pathname }).handler({ body, params: route.params, metadata: { locale: body.locale || 'ru-RU' } });
    send(res, response.status, JSON.parse(response.body), req);
  } catch {
    send(res, 503, { ok: false, error: { code: 'RU_STAGING_UNAVAILABLE', message: 'RU staging request failed' } }, req);
  } finally {
    process.stdout.write(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', operation: 'http.request', region: 'RU', statusCode: res.statusCode, durationBucket: bucket(Date.now() - started), deploymentVersion: process.env.DEPLOYMENT_VERSION || 'local' }) + '\n');
  }
});

server.listen(port, '0.0.0.0', () => console.log(JSON.stringify({ operation: 'ru.staging.started', region: 'RU', port, deploymentVersion: process.env.DEPLOYMENT_VERSION || 'local' })));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

function wireRuOnlyPostgres(application) {
  const container = application.getContainer();
  const config = container.resolve(TOKENS.config);
  const tokenHasher = new TokenHasher({ secret: requiredEnv('PUBLIC_TOKEN_HASH_SECRET'), version: config.get('security.publicTokenHashVersion') });
  const encryptionProvider = new ExternalKmsFieldEncryptionProvider({ providerConfig: requiredEnv('FIELD_ENCRYPTION_PROVIDER_CONFIG') });
  const databaseProvider = new PostgresDatabaseProvider({
    region: 'RU',
    config: { url: requiredEnv('RU_DATABASE_URL'), connectTimeoutMs: 3000, queryTimeoutMs: 5000 },
    client: null
  });
  const ruRepository = new PostgresLeadRepository({ databaseProvider, tokenHasher, encryptionProvider, region: 'RU' });
  container.register(TOKENS.leadRepositoryResolver, () => new RegionLeadRepositoryResolver({ repositories: { RU: ruRepository } }), { lifetime: 'singleton' });
}

function wireRuOnlyRouting(application) {
  const container = application.getContainer();
  const routingProvider = container.resolve(TOKENS.routingProvider);
  container.register(TOKENS.routingProvider, () => ({
    resolve(input, context) {
      const result = routingProvider.resolve(input, context);
      if (result.region !== 'RU') throw new InfrastructureError('RU staging accepts RU route only');
      return result;
    }
  }), { lifetime: 'singleton' });
}

function routeFor(method, url) {
  if (method === 'POST' && url === '/api/v1/leads') return { method, pathname: '/api/v1/leads', params: {} };
  const match = url.match(/^\/api\/v1\/leads\/([^/]+)$/);
  if (match && ['GET', 'PUT', 'DELETE'].includes(method)) return { method, pathname: '/api/v1/leads/{publicToken}', params: { publicToken: match[1] } };
  return null;
}

function isAllowedPath(method, url) {
  return url === '/health' || url === '/ready' || Boolean(routeFor(method, url));
}

function send(res, status, payload, req, extraHeaders = {}) {
  res.statusCode = status;
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(req), ...extraHeaders });
  res.end(status === 204 ? '' : JSON.stringify(payload));
}

function corsHeaders(req) {
  const origin = req?.headers?.origin || '';
  if (!origin || !allowedOrigins.has(origin)) return {};
  return { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type,x-w1zzydev-request-id,x-w1zzydev-synthetic-test' };
}

function checkRateLimit(req) {
  const key = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').replace(/[0-9a-f:.]/gi, '#');
  const now = Date.now();
  const windowMs = 60_000;
  const current = rateLimit.get(key) || { count: 0, expiresAt: now + windowMs };
  if (current.expiresAt < now) current.count = 0;
  current.count += 1;
  current.expiresAt = current.expiresAt < now ? now + windowMs : current.expiresAt;
  rateLimit.set(key, current);
  return current.count > Number(process.env.RATE_LIMIT_PER_MINUTE || 60);
}

async function readiness() {
  return { ok: true, components: [{ component: 'ru-postgres', region: 'RU', status: 'configured', migrationState: 'external-check-required' }] };
}

async function readyStatus() {
  return 200;
}

function bucket(ms) {
  if (ms < 100) return 'lt_100ms';
  if (ms < 500) return 'lt_500ms';
  if (ms < 1000) return 'lt_1s';
  return 'gte_1s';
}

function assertRuStagingEnvironment() {
  if (process.env.NODE_ENV === 'production') throw new Error('RU staging entrypoint is forbidden in production NODE_ENV');
  if (process.env.DEPLOYMENT_REGION && process.env.DEPLOYMENT_REGION !== 'RU') throw new Error('DEPLOYMENT_REGION must be RU');
  if (process.env.INTERNATIONAL_DATABASE_MODE && process.env.INTERNATIONAL_DATABASE_MODE !== 'disabled') throw new Error('INTERNATIONAL database must be disabled');
  if (process.env.FIELD_ENCRYPTION_MODE === 'noop_test_only' || process.env.FIELD_ENCRYPTION_MODE === 'disabled') throw new Error('Production-like field encryption provider is required');
  requiredEnv('RU_DATABASE_URL');
  requiredEnv('PUBLIC_TOKEN_HASH_SECRET');
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
