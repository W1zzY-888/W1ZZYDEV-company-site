export class HealthCheck {
  constructor({ version, featureFlags }) {
    this.version = version;
    this.featureFlags = featureFlags;
  }

  snapshot() {
    return {
      status: 'ok',
      version: this.version,
      timestamp: new Date().toISOString(),
      featureFlags: this.featureFlags.snapshot()
    };
  }
}
