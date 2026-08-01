import { ProviderContract } from './ProviderContract.js';

export class RoutingProvider extends ProviderContract {
  constructor() { super('RoutingProvider'); }
  resolve() { this.notImplemented('resolve'); }
  resolveRoute() { this.notImplemented('resolveRoute'); }
  bindRoute() { this.notImplemented('bindRoute'); }
  verifyRouteBinding() { this.notImplemented('verifyRouteBinding'); }
}
