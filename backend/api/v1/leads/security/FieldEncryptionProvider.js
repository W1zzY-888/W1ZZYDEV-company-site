import { InfrastructureError } from '../../../../core/errors.js';

export class FieldEncryptionProvider {
  encrypt() { throw new Error('FieldEncryptionProvider.encrypt is not implemented'); }
  decrypt() { throw new Error('FieldEncryptionProvider.decrypt is not implemented'); }
  getKeyVersion() { throw new Error('FieldEncryptionProvider.getKeyVersion is not implemented'); }
}

export class NoOpFieldEncryptionProvider extends FieldEncryptionProvider {
  constructor({ environment = 'test' } = {}) {
    super();
    if (environment === 'production') throw new InfrastructureError('NoOp field encryption is forbidden in production');
  }
  async encrypt(value) { return value; }
  async decrypt(value) { return value; }
  getKeyVersion() { return 'noop_test_only'; }
}

export class DisabledFieldEncryptionProvider extends FieldEncryptionProvider {
  encrypt() { throw new InfrastructureError('Field encryption provider is disabled'); }
  decrypt() { throw new InfrastructureError('Field encryption provider is disabled'); }
  getKeyVersion() { return 'disabled'; }
}

export class ExternalKmsFieldEncryptionProvider extends FieldEncryptionProvider {
  constructor({ providerConfig = '' } = {}) {
    super();
    if (!providerConfig) throw new InfrastructureError('External field encryption provider is not configured');
    this.providerConfig = providerConfig;
  }

  encrypt() {
    throw new InfrastructureError('External field encryption provider adapter is not connected');
  }

  decrypt() {
    throw new InfrastructureError('External field encryption provider adapter is not connected');
  }

  getKeyVersion() {
    return 'external_kms_pending';
  }
}
