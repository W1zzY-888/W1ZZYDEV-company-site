export class Container {
  #registrations = new Map();
  #instances = new Map();

  register(token, factory, options = {}) {
    if (!token || typeof factory !== 'function') throw new Error('Container registration requires token and factory');
    this.#registrations.set(token, { factory, lifetime: options.lifetime || 'scoped' });
    return this;
  }

  has(token) {
    return this.#registrations.has(token);
  }

  resolve(token) {
    const registration = this.#registrations.get(token);
    if (!registration) throw new Error(`Dependency is not registered: ${String(token)}`);
    if (registration.lifetime === 'singleton' && this.#instances.has(token)) return this.#instances.get(token);
    const instance = registration.factory(this);
    if (registration.lifetime === 'singleton') this.#instances.set(token, instance);
    return instance;
  }

  tokens() {
    return [...this.#registrations.keys()];
  }
}
