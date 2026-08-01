import { DataRegion, RoutingDecisionReason } from '../constants/routing-constants.js';

const allowedKeys = new Set([
  'selectedCountry',
  'serverCountryCode',
  'phone',
  'locale',
  'existingResourceRegion',
  'existingResourceId',
  'requestId'
]);

export class RoutingInputValidator {
  validate(input = {}) {
    if (!isPlainObject(input)) return invalid('Input must be a plain object');
    if (Object.keys(input).some(key => !allowedKeys.has(key))) return invalid('Unexpected route input field');
    if (hasPoisonKey(input)) return invalid('Unsafe object key');
    if (!shortString(input.selectedCountry, 64)) return invalid('Invalid selectedCountry');
    if (!shortString(input.serverCountryCode, 8)) return invalid('Invalid serverCountryCode');
    if (!shortString(input.phone, 32)) return invalid('Invalid phone');
    if (!shortString(input.locale, 16)) return invalid('Invalid locale');
    if (!shortString(input.existingResourceId, 128)) return invalid('Invalid existingResourceId');
    if (!shortString(input.requestId, 128)) return invalid('Invalid requestId');
    if (input.existingResourceRegion != null && ![DataRegion.RU, DataRegion.INTERNATIONAL].includes(input.existingResourceRegion)) {
      return invalid('Invalid existingResourceRegion');
    }
    return { ok: true, value: { ...input } };
  }
}

export function safeRoutingInputForPreview(input = {}) {
  const copy = isPlainObject(input) ? { ...input } : {};
  delete copy.existingResourceRegion;
  delete copy.existingResourceId;
  delete copy.routeRegion;
  return copy;
}

function invalid(message) {
  return { ok: false, reason: RoutingDecisionReason.INVALID_INPUT_SAFE_RU, message };
}

function shortString(value, max) {
  return value == null || (typeof value === 'string' && value.length <= max);
}

function isPlainObject(value) {
  return Boolean(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function hasPoisonKey(value) {
  return Object.keys(value).some(key => ['__proto__', 'prototype', 'constructor'].includes(key));
}
