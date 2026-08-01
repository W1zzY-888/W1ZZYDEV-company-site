import { Config } from './Config.js';
import { ErrorHandler } from './ErrorHandler.js';
import { FeatureFlagManager } from './FeatureFlagManager.js';
import { HealthCheck } from './HealthCheck.js';
import { Logger } from './Logger.js';
import { RequestContextFactory } from './RequestContext.js';
import { ResponseFactory } from './ResponseFactory.js';
import { VERSION } from './Version.js';
import { ApiRouter } from '../api/ApiRouter.js';
import { DisabledDatabaseProvider, InMemoryDatabaseProvider, PostgresDatabaseProvider } from '../database/providers/index.js';
import { InMemoryLeadRepository, LeadController, LeadFactory, LeadMapper, LeadService, LeadValidator, RegionLeadRepositoryResolver, TokenHasher, DisabledFieldEncryptionProvider, NoOpFieldEncryptionProvider } from '../api/v1/leads/index.js';
import { PolicyRoutingProvider } from '../routing/providers/PolicyRoutingProvider.js';
import { HeaderServerCountryResolver } from '../routing/services/ServerCountryResolver.js';
import { RoutingPreviewEndpoint } from '../routing/services/RoutingPreviewEndpoint.js';
import { TOKENS } from './tokens.js';

export function registerCoreServices(container, configValues = {}) {
  container
    .register(TOKENS.config, () => new Config(configValues), { lifetime: 'singleton' })
    .register(TOKENS.version, () => VERSION, { lifetime: 'singleton' })
    .register(TOKENS.featureFlags, c => new FeatureFlagManager(c.resolve(TOKENS.config).get('featureFlags')), { lifetime: 'singleton' })
    .register(TOKENS.logger, c => new Logger(c.resolve(TOKENS.config).get('logging')), { lifetime: 'singleton' })
    .register(TOKENS.responseFactory, () => new ResponseFactory(), { lifetime: 'singleton' })
    .register(TOKENS.errorHandler, c => new ErrorHandler({ logger: c.resolve(TOKENS.logger), responseFactory: c.resolve(TOKENS.responseFactory) }), { lifetime: 'singleton' })
    .register(TOKENS.requestContextFactory, c => new RequestContextFactory({ featureFlags: c.resolve(TOKENS.featureFlags) }), { lifetime: 'singleton' })
    .register(TOKENS.healthCheck, c => new HealthCheck({ version: c.resolve(TOKENS.version), featureFlags: c.resolve(TOKENS.featureFlags) }), { lifetime: 'singleton' })
    .register(TOKENS.serverCountryResolver, c => new HeaderServerCountryResolver({ config: c.resolve(TOKENS.config) }), { lifetime: 'singleton' })
    .register(TOKENS.routingProvider, c => new PolicyRoutingProvider({
      config: c.resolve(TOKENS.config),
      logger: c.resolve(TOKENS.logger)
    }), { lifetime: 'singleton' })
    .register(TOKENS.routingPreviewEndpoint, c => new RoutingPreviewEndpoint({
      config: c.resolve(TOKENS.config),
      routingProvider: c.resolve(TOKENS.routingProvider),
      responseFactory: c.resolve(TOKENS.responseFactory),
      requestContextFactory: c.resolve(TOKENS.requestContextFactory)
    }), { lifetime: 'singleton' })
    .register(TOKENS.leadRepository, () => new InMemoryLeadRepository(), { lifetime: 'singleton' })
    .register(TOKENS.databaseProviderRU, c => createDatabaseProvider(c.resolve(TOKENS.config), 'RU'), { lifetime: 'singleton' })
    .register(TOKENS.databaseProviderInternational, c => createDatabaseProvider(c.resolve(TOKENS.config), 'INTERNATIONAL'), { lifetime: 'singleton' })
    .register(TOKENS.tokenHasher, c => new TokenHasher({
      secret: c.resolve(TOKENS.config).get('security.publicTokenHashSecret'),
      version: c.resolve(TOKENS.config).get('security.publicTokenHashVersion')
    }), { lifetime: 'singleton' })
    .register(TOKENS.fieldEncryptionProvider, c => createEncryptionProvider(c.resolve(TOKENS.config)), { lifetime: 'singleton' })
    .register(TOKENS.leadRepositoryResolver, c => new RegionLeadRepositoryResolver({
      repositories: {
        RU: c.resolve(TOKENS.leadRepository),
        INTERNATIONAL: c.resolve(TOKENS.leadRepository)
      }
    }), { lifetime: 'singleton' })
    .register(TOKENS.leadValidator, () => new LeadValidator(), { lifetime: 'singleton' })
    .register(TOKENS.leadFactory, () => new LeadFactory(), { lifetime: 'singleton' })
    .register(TOKENS.leadMapper, () => new LeadMapper(), { lifetime: 'singleton' })
    .register(TOKENS.leadService, c => new LeadService({
      repository: c.resolve(TOKENS.leadRepositoryResolver),
      validator: c.resolve(TOKENS.leadValidator),
      routingProvider: c.resolve(TOKENS.routingProvider),
      factory: c.resolve(TOKENS.leadFactory),
      mapper: c.resolve(TOKENS.leadMapper),
      logger: c.resolve(TOKENS.logger)
    }), { lifetime: 'singleton' })
    .register(TOKENS.leadController, c => new LeadController({
      config: c.resolve(TOKENS.config),
      service: c.resolve(TOKENS.leadService),
      responseFactory: c.resolve(TOKENS.responseFactory),
      errorHandler: c.resolve(TOKENS.errorHandler),
      requestContextFactory: c.resolve(TOKENS.requestContextFactory)
    }), { lifetime: 'singleton' })
    .register(TOKENS.router, c => {
      const router = new ApiRouter({ config: c.resolve(TOKENS.config), responseFactory: c.resolve(TOKENS.responseFactory) });
      router.register({ method: 'POST', path: '/api/v1/internal/routing/preview', handler: payload => c.resolve(TOKENS.routingPreviewEndpoint).handle(payload) });
      router.register({ method: 'POST', path: '/api/v1/leads', handler: payload => c.resolve(TOKENS.leadController).create(payload) });
      router.register({ method: 'GET', path: '/api/v1/leads/{publicToken}', handler: payload => c.resolve(TOKENS.leadController).get(payload) });
      router.register({ method: 'PUT', path: '/api/v1/leads/{publicToken}', handler: payload => c.resolve(TOKENS.leadController).update(payload) });
      router.register({ method: 'DELETE', path: '/api/v1/leads/{publicToken}', handler: payload => c.resolve(TOKENS.leadController).delete(payload) });
      return router;
    }, { lifetime: 'singleton' });
  return container;
}

function createDatabaseProvider(config, region) {
  const regionConfig = config.get(`database.regions.${region}`);
  if (regionConfig?.mode === 'postgres') {
    return new PostgresDatabaseProvider({
      region,
      config: {
        url: regionConfig.url,
        ssl: regionConfig.ssl,
        connectTimeoutMs: config.get('database.connectTimeoutMs'),
        queryTimeoutMs: config.get('database.queryTimeoutMs')
      }
    });
  }
  if (regionConfig?.mode === 'in_memory') return new InMemoryDatabaseProvider(region);
  return new DisabledDatabaseProvider(region);
}

function createEncryptionProvider(config) {
  const mode = config.get('security.fieldEncryptionMode');
  if (mode === 'noop_test_only') return new NoOpFieldEncryptionProvider({ environment: config.get('environment') });
  return new DisabledFieldEncryptionProvider();
}
