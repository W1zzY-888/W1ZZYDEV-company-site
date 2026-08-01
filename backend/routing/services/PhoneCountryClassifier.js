import { PhoneCountryClassification } from '../constants/routing-constants.js';

export class PhoneCountryClassifier {
  classify(value) {
    if (value == null || value === '') return PhoneCountryClassification.EMPTY;
    if (typeof value !== 'string') return PhoneCountryClassification.INVALID;
    const trimmed = value.trim();
    if (!trimmed) return PhoneCountryClassification.EMPTY;
    if (trimmed.length > 32) return PhoneCountryClassification.INVALID;
    const prefix = trimmed.slice(0, 4).replace(/[()\s-]/g, '');
    if (!/^\+?\d{1,3}/.test(prefix)) return PhoneCountryClassification.INVALID;
    if (prefix.startsWith('+7') || prefix.startsWith('7')) return PhoneCountryClassification.RUSSIA_OR_KAZAKHSTAN_PREFIX;
    return PhoneCountryClassification.NON_RU_PREFIX;
  }
}
