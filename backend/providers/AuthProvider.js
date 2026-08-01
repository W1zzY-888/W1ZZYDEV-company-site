import { ProviderContract } from './ProviderContract.js';

export class AuthProvider extends ProviderContract {
  constructor() { super('AuthProvider'); }
  register() { this.notImplemented('register'); }
  login() { this.notImplemented('login'); }
  requestPasswordReset() { this.notImplemented('requestPasswordReset'); }
  verifySession() { this.notImplemented('verifySession'); }
}
