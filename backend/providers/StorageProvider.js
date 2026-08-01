import { ProviderContract } from './ProviderContract.js';

export class StorageProvider extends ProviderContract {
  constructor() { super('StorageProvider'); }
  createUploadIntent() { this.notImplemented('createUploadIntent'); }
  createSignedDownloadUrl() { this.notImplemented('createSignedDownloadUrl'); }
  deleteObject() { this.notImplemented('deleteObject'); }
  health() { this.notImplemented('health'); }
}
