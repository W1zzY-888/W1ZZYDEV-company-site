import { Application } from '../../index.js';
import { TOKENS } from '../../core/tokens.js';
import { AuthorizationError, NotFoundError } from '../../core/errors.js';
import { DataRegion } from '../constants/routing-constants.js';
import { assert, assertEqual } from './assert.js';

const app = new Application({ env: { NODE_ENV: 'test' } });
const container = app.getContainer();
const routingProvider = container.resolve(TOKENS.routingProvider);
const contextFactory = container.resolve(TOKENS.requestContextFactory);
const context = contextFactory.create({ ip: '203.0.113.8', locale: 'ru-RU' });
const result = routingProvider.resolve({ selectedCountry: 'Russia', requestId: context.requestId }, context);
const routedContext = contextFactory.withRoutingResult(context, result);

assertEqual(result.region, DataRegion.RU, 'Application resolves routing provider');
assertEqual(routedContext.routeRegion, DataRegion.RU, 'RequestContext accepts routing result');
assertEqual(container.resolve(TOKENS.serverCountryResolver).resolve({ headers: { 'cf-ipcountry': 'RU' } }).trusted, false, 'country header disabled by default');

const router = app.router();
const route = router.resolve({ method: 'POST', pathname: '/api/v1/internal/routing/preview' });
assert(route.handler, 'preview route is registered');
try {
  route.handler({ body: { selectedCountry: 'RU' } });
  throw new Error('Preview endpoint should be disabled by default');
} catch (error) {
  assert(error instanceof NotFoundError, 'preview endpoint disabled by default');
}

const prodApp = new Application({
  env: {
    NODE_ENV: 'production',
    ROUTING_PREVIEW_ENDPOINT_ENABLED: 'true',
    ALLOW_ROUTING_PREVIEW_IN_PRODUCTION: 'false'
  }
});
try {
  prodApp.getContainer().resolve(TOKENS.routingPreviewEndpoint).handle({ body: { selectedCountry: 'RU' } });
  throw new Error('Preview endpoint should be blocked in production');
} catch (error) {
  assert(error instanceof AuthorizationError, 'preview endpoint forbidden in production without override');
}

const enabledApp = new Application({
  env: {
    NODE_ENV: 'test',
    ROUTING_PREVIEW_ENDPOINT_ENABLED: 'true'
  }
});
const response = enabledApp.getContainer().resolve(TOKENS.routingPreviewEndpoint).handle({ body: { selectedCountry: 'RU', existingResourceRegion: 'INTERNATIONAL' } });
const parsed = JSON.parse(response.body);
assertEqual(parsed.data.region, DataRegion.RU, 'preview strips existingResourceRegion from public body');

console.log('routing-integration.test: ok');
