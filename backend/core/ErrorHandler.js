import { BackendError } from './errors.js';

export class ErrorHandler {
  constructor({ logger, responseFactory }) {
    this.logger = logger;
    this.responseFactory = responseFactory;
  }

  handle(error, context = {}) {
    const normalized = error instanceof BackendError
      ? error
      : new BackendError('Unexpected backend error');
    this.logger?.error('backend.error', {
      code: normalized.code,
      status: normalized.status,
      requestId: context.requestId
    });
    return this.responseFactory.error(normalized, context.requestId);
  }
}
