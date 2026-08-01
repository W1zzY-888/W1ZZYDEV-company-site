import { DatabaseProvider } from '../../providers/DatabaseProvider.js';

export class InMemoryDatabaseProvider extends DatabaseProvider {
  constructor(region = 'UNKNOWN') {
    super();
    this.region = region;
  }
  async connect() { return true; }
  async disconnect() { return true; }
  async query() { return { rows: [], rowCount: 0 }; }
  async transaction(callback) { return callback(this); }
  async health() { return { status: 'ok', latencyBucket: 'memory', checkedAt: new Date().toISOString(), region: this.region }; }
}
