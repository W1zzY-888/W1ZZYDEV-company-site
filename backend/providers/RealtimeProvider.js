import { ProviderContract } from './ProviderContract.js';

export class RealtimeProvider extends ProviderContract {
  constructor() { super('RealtimeProvider'); }
  publish() { this.notImplemented('publish'); }
  subscribe() { this.notImplemented('subscribe'); }
  health() { this.notImplemented('health'); }
}
