import { NotFoundError } from '../core/errors.js';

export class ApiRouter {
  constructor({ config, responseFactory }) {
    this.config = config;
    this.responseFactory = responseFactory;
    this.routes = new Map();
  }

  supportedVersions() {
    return this.config.get('supportedApiVersions', ['v1']);
  }

  matchesVersion(pathname = '') {
    return this.supportedVersions().some(version => pathname.startsWith(`${this.config.get('apiPrefix')}/${version}/`));
  }

  register(route) {
    const key = routeKey(route.method, route.path);
    this.routes.set(key, route);
    return this;
  }

  resolve({ method = 'GET', pathname = '' } = {}) {
    if (!this.matchesVersion(pathname)) throw new NotFoundError('Unsupported API version');
    const route = this.routes.get(routeKey(method, pathname));
    if (!route) throw new NotFoundError('Backend Core router has no handlers registered yet');
    return route;
  }

  listRoutes() {
    return [...this.routes.values()].map(route => ({ method: route.method, path: route.path }));
  }
}

function routeKey(method, pathname) {
  return `${String(method).toUpperCase()} ${pathname}`;
}
