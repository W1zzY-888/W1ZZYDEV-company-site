export class ProviderContract {
  constructor(providerName) {
    if (new.target === ProviderContract) throw new TypeError('ProviderContract is abstract');
    this.providerName = providerName;
  }

  notImplemented(methodName) {
    throw new Error(`${this.providerName}.${methodName} is an interface method and has no implementation yet`);
  }
}
