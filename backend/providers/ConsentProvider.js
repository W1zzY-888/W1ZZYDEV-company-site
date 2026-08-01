import { ProviderContract } from './ProviderContract.js';

export class ConsentProvider extends ProviderContract {
  constructor() { super('ConsentProvider'); }
  recordConsent() { this.notImplemented('recordConsent'); }
  withdrawConsent() { this.notImplemented('withdrawConsent'); }
  getConsentState() { this.notImplemented('getConsentState'); }
}
