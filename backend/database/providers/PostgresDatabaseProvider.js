import { InfrastructureError } from '../../core/errors.js';
import { DatabaseProvider } from '../../providers/DatabaseProvider.js';

export class PostgresDatabaseProvider extends DatabaseProvider {
  constructor({ region, config, client = null }) {
    super();
    this.region = region;
    this.config = config;
    this.client = client;
    this.connected = false;
  }

  async connect() {
    if (!this.config?.url && !this.client) throw new InfrastructureError('Postgres database URL is not configured', { region: this.region });
    if (!this.client) throw new InfrastructureError('Postgres client is not installed or injected', { region: this.region });
    if (this.client.connect) await withTimeout(this.client.connect(), this.config.connectTimeoutMs);
    this.connected = true;
    return true;
  }

  async disconnect() {
    if (this.client?.end) await this.client.end();
    this.connected = false;
    return true;
  }

  async query(sql, params = []) {
    if (!this.client?.query) throw new InfrastructureError('Postgres client is unavailable', { region: this.region });
    return withTimeout(this.client.query(sql, params), this.config.queryTimeoutMs);
  }

  async transaction(callback) {
    await this.query('BEGIN', []);
    try {
      const result = await callback(this);
      await this.query('COMMIT', []);
      return result;
    } catch (error) {
      await this.query('ROLLBACK', []).catch(() => null);
      throw error;
    }
  }

  async health() {
    const started = Date.now();
    try {
      await this.query('SELECT 1 AS ok', []);
      return { status: 'ok', latencyBucket: bucket(Date.now() - started), checkedAt: new Date().toISOString(), region: this.region };
    } catch {
      return { status: 'unavailable', latencyBucket: 'unknown', checkedAt: new Date().toISOString(), region: this.region };
    }
  }
}

function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => setTimeout(() => reject(new InfrastructureError('Database operation timed out')), timeoutMs))
  ]);
}

function bucket(ms) {
  if (ms < 25) return 'lt_25ms';
  if (ms < 100) return 'lt_100ms';
  if (ms < 500) return 'lt_500ms';
  return 'gte_500ms';
}
