import { NotFoundError, ValidationError } from '../../../../core/errors.js';

export class LeadValidationError extends ValidationError {
  constructor(message = 'Lead validation failed', details = {}) {
    super(message, details);
    this.code = 'LEAD_VALIDATION_ERROR';
  }
}

export class LeadNotFoundError extends NotFoundError {
  constructor(message = 'Lead not found', details = {}) {
    super(message, details);
    this.code = 'LEAD_NOT_FOUND';
  }
}
