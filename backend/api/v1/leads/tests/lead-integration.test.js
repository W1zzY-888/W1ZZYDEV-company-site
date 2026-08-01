import { Application } from '../../../../index.js';
import { TOKENS } from '../../../../core/tokens.js';
import { ContactType, LeadStatus } from '../types/LeadTypes.js';
import { assert, assertEqual } from './assert.js';

const disabledApp = new Application({ env: { NODE_ENV: 'test' } });
const disabledRouter = disabledApp.router();
const disabledRoute = disabledRouter.resolve({ method: 'POST', pathname: '/api/v1/leads' });
const disabledResponse = await disabledRoute.handler({ body: {} });
assertEqual(disabledResponse.status, 404, 'Lead API disabled by default');

const app = new Application({ env: { NODE_ENV: 'test', LEAD_API_ENABLED: 'true' } });
const container = app.getContainer();
const router = app.router();
assert(container.has(TOKENS.leadController), 'lead controller registered');
assert(container.has(TOKENS.leadService), 'lead service registered');
assert(container.has(TOKENS.leadRepository), 'lead repository registered');

const createRoute = router.resolve({ method: 'POST', pathname: '/api/v1/leads' });
const getRoute = router.resolve({ method: 'GET', pathname: '/api/v1/leads/{publicToken}' });
const updateRoute = router.resolve({ method: 'PUT', pathname: '/api/v1/leads/{publicToken}' });
const deleteRoute = router.resolve({ method: 'DELETE', pathname: '/api/v1/leads/{publicToken}' });

const createResponse = await createRoute.handler({
  body: {
    selectedCountry: 'US',
    serverCountryCode: 'US',
    locale: 'en-US',
    name: 'Jane',
    contactType: ContactType.EMAIL,
    contactValue: 'jane@example.test',
    message: 'Build landing page',
    consentId: 'consent-2',
    metadata: { page: 'contact' }
  },
  metadata: { ip: '198.51.100.10', locale: 'en-US' }
});
assertEqual(createResponse.status, 201, 'create returns 201');
const created = JSON.parse(createResponse.body).data;
assertEqual(created.region, 'INTERNATIONAL', 'create uses backend routing');
assert(created.publicToken.startsWith('lead_'), 'create returns public token');
assert(!created.id, 'create response hides id');

const getResponse = await getRoute.handler({ params: { publicToken: created.publicToken } });
assertEqual(getResponse.status, 200, 'get returns 200');
assertEqual(JSON.parse(getResponse.body).data.publicToken, created.publicToken, 'get returns lead');

const updateResponse = await updateRoute.handler({ params: { publicToken: created.publicToken }, body: { status: LeadStatus.IN_PROGRESS, message: 'Updated safe message' } });
assertEqual(updateResponse.status, 200, 'update returns 200');
assertEqual(JSON.parse(updateResponse.body).data.status, LeadStatus.IN_PROGRESS, 'update changes status');

const badUpdate = await updateRoute.handler({ params: { publicToken: created.publicToken }, body: { status: 'BAD' } });
assertEqual(badUpdate.status, 400, 'bad update returns validation error');

const deleteResponse = await deleteRoute.handler({ params: { publicToken: created.publicToken } });
assertEqual(deleteResponse.status, 200, 'delete returns 200');
assertEqual(JSON.parse(deleteResponse.body).data.deleted, true, 'delete result true');

const getDeleted = await getRoute.handler({ params: { publicToken: created.publicToken } });
assertEqual(getDeleted.status, 404, 'deleted lead not found');

const invalidCreate = await createRoute.handler({ body: { selectedCountry: 'RU', routeRegion: 'INTERNATIONAL' } });
assertEqual(invalidCreate.status, 400, 'routeRegion injection rejected');
assert(!invalidCreate.body.includes('Error:'), 'no stack trace in validation response');

const ruResponse = await createRoute.handler({
  body: {
    selectedCountry: 'Russia',
    serverCountryCode: 'US',
    locale: 'ru-RU',
    name: 'Ivan',
    contactType: ContactType.TELEGRAM,
    contactValue: '@ivan',
    message: 'Project',
    consentId: 'consent-3'
  }
});
assertEqual(JSON.parse(ruResponse.body).data.region, 'RU', 'selected Russia routes RU');

const conflictResponse = await createRoute.handler({
  body: {
    selectedCountry: 'US',
    serverCountryCode: 'RU',
    locale: 'en-US',
    name: 'Alex',
    contactType: ContactType.OTHER,
    contactValue: 'contact',
    message: 'Project',
    consentId: 'consent-4'
  }
});
assertEqual(JSON.parse(conflictResponse.body).data.region, 'RU', 'server RU conflict routes RU');

assertEqual(router.listRoutes().some(route => route.path === '/api/v1/leads'), true, 'post route registered');
assertEqual(router.listRoutes().some(route => route.path === '/api/v1/leads/{publicToken}'), true, 'token routes registered');

console.log('lead-integration.test: ok');
