import { NotFoundError } from '../../../../core/errors.js';

export class LeadController {
  constructor({ config, service, responseFactory, errorHandler, requestContextFactory }) {
    this.config = config;
    this.service = service;
    this.responseFactory = responseFactory;
    this.errorHandler = errorHandler;
    this.requestContextFactory = requestContextFactory;
  }

  async create(request = {}) {
    return this.handle(request, context => this.service.create(request.body || {}, context), 201);
  }

  async get(request = {}) {
    return this.handle(request, context => this.service.get(request.params?.publicToken || '', context));
  }

  async update(request = {}) {
    return this.handle(request, context => this.service.update(request.params?.publicToken || '', request.body || {}, context));
  }

  async delete(request = {}) {
    return this.handle(request, context => this.service.delete(request.params?.publicToken || '', context));
  }

  async handle(request, action, successStatus = 200) {
    const context = this.requestContextFactory.create({
      ip: request.metadata?.ip || '',
      country: request.metadata?.country || '',
      locale: request.body?.locale || request.metadata?.locale || 'ru',
      routeRegion: 'UNKNOWN'
    });
    try {
      if (!this.config.get('featureFlags.LEAD_API_ENABLED')) throw new NotFoundError('Lead API is disabled');
      const data = await action(context);
      return this.responseFactory.json({ ok: true, data }, { status: successStatus });
    } catch (error) {
      return this.errorHandler.handle(error, context);
    }
  }
}
