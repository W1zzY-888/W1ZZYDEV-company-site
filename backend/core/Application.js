import { EnvironmentLoader } from '../config/environment.js';
import { ApiRouter } from '../api/ApiRouter.js';
import { Container } from './Container.js';
import { registerCoreServices } from './service-manifest.js';
import { TOKENS } from './tokens.js';

export class Application {
  constructor({ env = process.env, container = new Container() } = {}) {
    this.environment = new EnvironmentLoader(env);
    this.container = registerCoreServices(container, this.environment.load());
  }

  getContainer() {
    return this.container;
  }

  health() {
    return this.container.resolve(TOKENS.healthCheck).snapshot();
  }

  router() {
    const router = this.container.resolve(TOKENS.router);
    if (!(router instanceof ApiRouter)) throw new Error('Invalid router registration');
    return router;
  }
}
