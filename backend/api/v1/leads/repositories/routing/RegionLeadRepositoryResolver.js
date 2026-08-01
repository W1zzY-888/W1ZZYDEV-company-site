import { InfrastructureError } from '../../../../../core/errors.js';

export class RegionLeadRepositoryResolver {
  constructor({ repositories }) {
    this.repositories = repositories;
  }

  resolve(region) {
    const repository = this.repositories?.[region];
    if (!repository) throw new InfrastructureError('Lead repository is unavailable for region', { region });
    return repository;
  }

  async health() {
    const entries = await Promise.all(Object.entries(this.repositories || {}).map(async ([region, repository]) => {
      try {
        return [region, await repository.health()];
      } catch {
        return [region, { status: 'unavailable', latencyBucket: 'unknown', checkedAt: new Date().toISOString(), region }];
      }
    }));
    return Object.fromEntries(entries);
  }
}
