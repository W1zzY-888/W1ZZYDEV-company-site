import { AuthorizationError, NotFoundError, ValidationError } from '../../core/errors.js';
import { safeRoutingInputForPreview } from '../validation/RoutingInputValidator.js';

export class RoutingPreviewEndpoint {
  constructor({ config, routingProvider, responseFactory, requestContextFactory }) {
    this.config = config;
    this.routingProvider = routingProvider;
    this.responseFactory = responseFactory;
    this.requestContextFactory = requestContextFactory;
  }

  handle({ body = {}, metadata = {} } = {}) {
    if (!this.isEnabled()) throw new NotFoundError('Routing preview endpoint is disabled');
    if (!isPlainObject(body)) throw new ValidationError('Routing preview accepts metadata object only');
    const context = this.requestContextFactory.create({
      ip: metadata.ip || '',
      country: '',
      locale: typeof body.locale === 'string' ? body.locale : 'unknown',
      routeRegion: 'UNKNOWN'
    });
    const result = this.routingProvider.resolve(safeRoutingInputForPreview(body), context);
    return this.responseFactory.ok(result);
  }

  isEnabled() {
    const flags = this.config.get('featureFlags');
    const isProduction = this.config.get('environment') === 'production';
    if (!flags.ROUTING_PREVIEW_ENDPOINT_ENABLED) return false;
    if (isProduction && !flags.ALLOW_ROUTING_PREVIEW_IN_PRODUCTION) throw new AuthorizationError('Routing preview is forbidden in production');
    return true;
  }
}

function isPlainObject(value) {
  return Boolean(value) && Object.getPrototypeOf(value) === Object.prototype;
}
