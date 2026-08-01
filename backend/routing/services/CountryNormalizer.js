import { NormalizedCountry } from '../constants/routing-constants.js';

const countryMap = new Map([
  ['ru', NormalizedCountry.RU],
  ['rus', NormalizedCountry.RU],
  ['russia', NormalizedCountry.RU],
  ['россия', NormalizedCountry.RU],
  ['российская федерация', NormalizedCountry.RU],
  ['us', NormalizedCountry.US],
  ['usa', NormalizedCountry.US],
  ['united states', NormalizedCountry.US],
  ['united states of america', NormalizedCountry.US],
  ['сша', NormalizedCountry.US],
  ['kz', NormalizedCountry.KZ],
  ['kaz', NormalizedCountry.KZ],
  ['kazakhstan', NormalizedCountry.KZ],
  ['казахстан', NormalizedCountry.KZ],
  ['other', NormalizedCountry.OTHER],
  ['другая страна', NormalizedCountry.OTHER],
  ['другое', NormalizedCountry.OTHER]
]);

export class CountryNormalizer {
  normalize(value) {
    if (value == null || value === '') return NormalizedCountry.UNKNOWN;
    if (typeof value !== 'string') return NormalizedCountry.UNKNOWN;
    const normalized = value.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!normalized || normalized.length > 64) return NormalizedCountry.UNKNOWN;
    return countryMap.get(normalized) || NormalizedCountry.OTHER;
  }
}
