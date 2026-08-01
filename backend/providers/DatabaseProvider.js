import { ProviderContract } from './ProviderContract.js';

export class DatabaseProvider extends ProviderContract {
  constructor() { super('DatabaseProvider'); }
  connect() { this.notImplemented('connect'); }
  disconnect() { this.notImplemented('disconnect'); }
  transaction() { this.notImplemented('transaction'); }
  query() { this.notImplemented('query'); }
  health() { this.notImplemented('health'); }
}
