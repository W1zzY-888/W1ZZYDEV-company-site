import { Application } from '../index.js';
import { TOKENS } from '../core/tokens.js';

const app = new Application({ env: { NODE_ENV: 'test' } });
const container = app.getContainer();

for (const token of Object.values(TOKENS)) {
  if (!container.has(token)) throw new Error(`Missing container token: ${token}`);
  container.resolve(token);
}

const health = app.health();
if (health.status !== 'ok') throw new Error('Health check did not return ok');
if (health.featureFlags.DIRECT_SUPABASE_LEGACY_MODE !== true) throw new Error('Legacy flag must stay enabled by default');
if (health.featureFlags.NEW_BACKEND_ENABLED !== false) throw new Error('New backend must stay disabled by default');

const router = app.router();
if (!router.matchesVersion('/api/v1/health')) throw new Error('Router must recognize /api/v1/');
if (router.matchesVersion('/api/v2/health')) throw new Error('Router must reject unsupported versions');

console.log('build-check: ok');
