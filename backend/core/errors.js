export class BackendError extends Error {
  constructor(message, { code = 'BACKEND_ERROR', status = 500, details = {} } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends BackendError {
  constructor(message = 'Validation failed', details = {}) { super(message, { code: 'VALIDATION_ERROR', status: 400, details }); }
}

export class AuthorizationError extends BackendError {
  constructor(message = 'Authorization failed', details = {}) { super(message, { code: 'AUTHORIZATION_ERROR', status: 401, details }); }
}

export class NotFoundError extends BackendError {
  constructor(message = 'Resource not found', details = {}) { super(message, { code: 'NOT_FOUND', status: 404, details }); }
}

export class ConflictError extends BackendError {
  constructor(message = 'Conflict', details = {}) { super(message, { code: 'CONFLICT', status: 409, details }); }
}

export class InfrastructureError extends BackendError {
  constructor(message = 'Infrastructure error', details = {}) { super(message, { code: 'INFRASTRUCTURE_ERROR', status: 503, details }); }
}

export class DatabaseError extends InfrastructureError {
  constructor(message = 'Database error', details = {}) {
    super(message, details);
    this.code = 'DATABASE_ERROR';
  }
}

export class StorageError extends InfrastructureError {
  constructor(message = 'Storage error', details = {}) {
    super(message, details);
    this.code = 'STORAGE_ERROR';
  }
}
