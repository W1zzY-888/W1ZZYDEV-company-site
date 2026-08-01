export class LeadPersistenceHealth {
  constructor({ repositoryResolver, databaseProviders = {} }) {
    this.repositoryResolver = repositoryResolver;
    this.databaseProviders = databaseProviders;
  }

  async snapshot() {
    const repositoryHealth = await this.repositoryResolver.health();
    return {
      leadRepositoryRU: sanitize(repositoryHealth.RU, 'RU'),
      leadRepositoryInternational: sanitize(repositoryHealth.INTERNATIONAL, 'INTERNATIONAL'),
      databaseProviderRU: await providerHealth(this.databaseProviders.RU, 'RU'),
      databaseProviderInternational: await providerHealth(this.databaseProviders.INTERNATIONAL, 'INTERNATIONAL')
    };
  }
}

async function providerHealth(provider, region) {
  if (!provider?.health) return { status: 'unavailable', latencyBucket: 'unknown', checkedAt: new Date().toISOString(), region };
  return sanitize(await provider.health(), region);
}

function sanitize(health = {}, region) {
  return {
    status: health.status || 'unknown',
    latencyBucket: health.latencyBucket || 'unknown',
    checkedAt: health.checkedAt || new Date().toISOString(),
    region
  };
}
