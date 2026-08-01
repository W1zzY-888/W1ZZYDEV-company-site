import { Application } from '../../index.js';
import { TOKENS } from '../../core/tokens.js';
import { DataRegion, RoutingDecisionReason } from '../constants/routing-constants.js';
import { RoutingPolicy202607V1 } from '../policies/RoutingPolicy202607V1.js';
import { HeaderServerCountryResolver } from '../services/ServerCountryResolver.js';
import { assert, assertEqual } from './assert.js';

const policy = new RoutingPolicy202607V1();
const poison = JSON.parse('{"__proto__":{"polluted":true},"locale":"en-US"}');
assertEqual(policy.decide(poison).reason, RoutingDecisionReason.INVALID_INPUT_SAFE_RU, 'prototype pollution input safe fallback');
assertEqual({}.polluted, undefined, 'prototype not polluted');
assertEqual(policy.decide({ selectedCountry: 'R'.repeat(1000) }).reason, RoutingDecisionReason.INVALID_INPUT_SAFE_RU, 'oversized selectedCountry safe fallback');
assertEqual(policy.decide({ serverCountryCode: 'RUSSIA_TOO_LONG' }).reason, RoutingDecisionReason.INVALID_INPUT_SAFE_RU, 'malformed country safe fallback');
assertEqual(policy.decide({ locale: 'ru-'.repeat(20) }).reason, RoutingDecisionReason.INVALID_INPUT_SAFE_RU, 'malformed locale safe fallback');
assertEqual(policy.decide({ phone: '+7'.repeat(40) }).reason, RoutingDecisionReason.INVALID_INPUT_SAFE_RU, 'oversized phone safe fallback');
assertEqual(policy.decide({ routeRegion: 'INTERNATIONAL', locale: 'ru' }).region, DataRegion.RU, 'direct routeRegion injection ignored safely');

const entries = [];
const sink = { info: line => entries.push(line), debug: line => entries.push(line), warn: line => entries.push(line), error: line => entries.push(line) };
const app = new Application({ env: { NODE_ENV: 'test' } });
const config = app.getContainer().resolve(TOKENS.config);
const logger = new (await import('../../core/Logger.js')).Logger({ ...config.get('logging'), sink });
const routingProvider = new (await import('../providers/PolicyRoutingProvider.js')).PolicyRoutingProvider({ config, logger });
routingProvider.resolve({ selectedCountry: 'US', serverCountryCode: 'RU', phone: '+7 999 111 22 33', existingResourceId: 'secret-token' }, { requestId: 'req-test', ip: '198.51.100.9' });
const joined = entries.join('\n');
assert(!joined.includes('+7 999'), 'logger does not receive full phone');
assert(!joined.includes('198.51.100.9'), 'logger does not receive full IP');
assert(!joined.includes('secret-token'), 'logger does not receive publicResourceToken or resource id');

const resolver = new HeaderServerCountryResolver({ config });
assertEqual(resolver.resolve({ headers: { 'x-forwarded-for': '1.2.3.4', 'cf-ipcountry': 'RU' } }).countryCode, 'UNKNOWN', 'headers are not trusted by default');

const preview = new Application({ env: { NODE_ENV: 'test', ROUTING_PREVIEW_ENDPOINT_ENABLED: 'true' } })
  .getContainer()
  .resolve(TOKENS.routingPreviewEndpoint);
const response = preview.handle({ body: { selectedCountry: 'RU', existingResourceId: 'internal-id', existingResourceRegion: 'INTERNATIONAL' } });
const parsed = JSON.parse(response.body);
assert(!response.body.includes('internal-id'), 'preview does not echo existingResourceId');
assertEqual(parsed.data.region, DataRegion.RU, 'preview strips attempted region lock');

console.log('routing-security.test: ok');
