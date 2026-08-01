import { LeadValidationError } from '../errors/LeadErrors.js';
import { ContactType, LeadStatus } from '../types/LeadTypes.js';

const allowedCreateKeys = new Set(['selectedCountry', 'serverCountryCode', 'phone', 'locale', 'name', 'contactType', 'contactValue', 'message', 'consentId', 'attachmentsCount', 'source', 'language', 'metadata', 'clientRequestId']);
const allowedUpdateKeys = new Set(['status', 'message', 'metadata']);

export class LeadValidator {
  validateCreate(input) {
    const payload = validatePlainObject(input, allowedCreateKeys);
    const normalized = {
      selectedCountry: text(payload.selectedCountry, 64, 'selectedCountry'),
      serverCountryCode: optionalText(payload.serverCountryCode, 8, 'serverCountryCode'),
      phone: optionalText(payload.phone, 32, 'phone'),
      locale: optionalText(payload.locale, 16, 'locale') || optionalText(payload.language, 16, 'language') || 'ru',
      name: text(payload.name, 80, 'name'),
      contactType: enumValue(payload.contactType, ContactType, 'contactType'),
      contactValue: text(payload.contactValue, 160, 'contactValue'),
      message: text(payload.message, 3000, 'message'),
      consentId: text(payload.consentId, 128, 'consentId'),
      attachmentsCount: integer(payload.attachmentsCount ?? 0, 0, 20, 'attachmentsCount'),
      source: optionalText(payload.source, 64, 'source') || 'WEBSITE',
      language: optionalText(payload.language, 16, 'language') || 'ru',
      metadata: metadata(payload.metadata),
      clientRequestId: optionalClientRequestId(payload.clientRequestId)
    };
    rejectXss(normalized.name, 'name');
    rejectXss(normalized.contactValue, 'contactValue');
    rejectXss(normalized.message, 'message');
    return normalized;
  }

  validateUpdate(input) {
    const payload = validatePlainObject(input, allowedUpdateKeys);
    const output = {};
    if (payload.status != null) output.status = enumValue(payload.status, LeadStatus, 'status');
    if (payload.message != null) {
      output.message = text(payload.message, 3000, 'message');
      rejectXss(output.message, 'message');
    }
    if (payload.metadata != null) output.metadata = metadata(payload.metadata);
    if (!Object.keys(output).length) throw new LeadValidationError('No update fields provided');
    return output;
  }

  validatePublicToken(publicToken) {
    if (typeof publicToken !== 'string' || !/^lead_[A-Za-z0-9_-]{24,}$/.test(publicToken)) throw new LeadValidationError('Invalid lead token');
    return publicToken;
  }
}

function optionalClientRequestId(value) {
  if (value == null || value === '') return '';
  if (typeof value !== 'string') throw new LeadValidationError('clientRequestId is invalid');
  const trimmed = value.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
    throw new LeadValidationError('clientRequestId is invalid');
  }
  return trimmed;
}

function validatePlainObject(input, allowedKeys) {
  if (!input || Object.getPrototypeOf(input) !== Object.prototype) throw new LeadValidationError('Payload must be an object');
  const keys = Object.keys(input);
  if (keys.some(key => ['__proto__', 'prototype', 'constructor'].includes(key))) throw new LeadValidationError('Unsafe payload key');
  if (keys.some(key => !allowedKeys.has(key))) throw new LeadValidationError('Unexpected payload field');
  if (JSON.stringify(input).length > 12000) throw new LeadValidationError('Payload is too large');
  return input;
}

function text(value, max, field) {
  if (typeof value !== 'string') throw new LeadValidationError(`${field} is required`);
  const trimmed = value.trim();
  if (!trimmed) throw new LeadValidationError(`${field} is required`);
  if (trimmed.length > max) throw new LeadValidationError(`${field} is too long`);
  return trimmed;
}

function optionalText(value, max, field) {
  if (value == null || value === '') return '';
  return text(value, max, field);
}

function enumValue(value, values, field) {
  if (!Object.values(values).includes(value)) throw new LeadValidationError(`${field} is invalid`);
  return value;
}

function integer(value, min, max, field) {
  if (!Number.isInteger(value) || value < min || value > max) throw new LeadValidationError(`${field} is invalid`);
  return value;
}

function metadata(value) {
  const allowed = new Set(['campaign', 'page', 'referrerCategory', 'formId', 'utmSource', 'utmMedium', 'utmCampaign', 'legacyResult', 'originalCountryCode']);
  if (value == null) return {};
  if (Object.getPrototypeOf(value) !== Object.prototype) throw new LeadValidationError('metadata is invalid');
  const keys = Object.keys(value);
  if (keys.length > 20 || keys.some(key => key.length > 64 || ['__proto__', 'prototype', 'constructor'].includes(key))) throw new LeadValidationError('metadata is invalid');
  if (keys.some(key => !allowed.has(key))) throw new LeadValidationError('metadata contains unsupported field');
  const serialized = JSON.stringify(value);
  if (serialized.length > 1500) throw new LeadValidationError('metadata is too large');
  return Object.fromEntries(keys.map(key => [key, value[key]]).filter(([, item]) => ['string', 'number', 'boolean'].includes(typeof item)));
}

function rejectXss(value, field) {
  if (/[<>]|javascript:/i.test(value)) throw new LeadValidationError(`${field} contains unsafe content`);
}
