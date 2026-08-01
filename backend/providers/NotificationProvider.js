import { ProviderContract } from './ProviderContract.js';

export class NotificationProvider extends ProviderContract {
  constructor() { super('NotificationProvider'); }
  notify() { this.notImplemented('notify'); }
  health() { this.notImplemented('health'); }
}
