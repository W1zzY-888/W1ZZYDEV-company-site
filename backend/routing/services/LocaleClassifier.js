import { LocaleClassification } from '../constants/routing-constants.js';

export class LocaleClassifier {
  classify(value) {
    if (value == null || value === '') return LocaleClassification.UNKNOWN;
    if (typeof value !== 'string') return LocaleClassification.UNKNOWN;
    const normalized = value.trim().replace('_', '-').toLowerCase();
    if (!normalized || normalized.length > 16 || !/^[a-z]{2,3}(-[a-z]{2})?$/.test(normalized)) return LocaleClassification.UNKNOWN;
    if (normalized === 'ru' || normalized.startsWith('ru-')) return LocaleClassification.RUSSIAN;
    if (normalized === 'en' || normalized.startsWith('en-')) return LocaleClassification.ENGLISH;
    return LocaleClassification.OTHER;
  }
}
