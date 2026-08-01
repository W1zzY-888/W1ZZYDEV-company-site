import { InfrastructureError } from '../../core/errors.js';
import { DatabaseProvider } from '../../providers/DatabaseProvider.js';

export class DisabledDatabaseProvider extends DatabaseProvider {
  constructor(region = 'UNKNOWN') {
    super();
    this.region = region;
  }

  connect() { throw unavailable(this.region); }
  disconnect() { return true; }
  query() { throw unavailable(this.region); }
  transaction() { throw unavailable(this.region); }
  health() {
    return { status: 'disabled', latencyBucket: 'none', checkedAt: new Date().toISOString(), region: this.region };
  }
}

function unavailable(region) {
  return new InfrastructureError('Database provider is unavailable', { region });
}
