import { createHash, randomUUID } from 'node:crypto';

export class RequestContextFactory {
  constructor({ featureFlags }) {
    this.featureFlags = featureFlags;
  }

  create({ ip = '', country = '', locale = 'ru', routeRegion = 'UNKNOWN' } = {}) {
    return {
      requestId: randomUUID(),
      timestamp: new Date().toISOString(),
      ipHash: hashIp(ip),
      country,
      locale,
      routeRegion,
      featureFlags: this.featureFlags.snapshot()
    };
  }

  withRoutingResult(context, routingResult) {
    return {
      ...context,
      routeRegion: routingResult?.region || context.routeRegion
    };
  }
}

function hashIp(ip) {
  if (!ip) return '';
  return createHash('sha256').update(String(ip)).digest('hex');
}
