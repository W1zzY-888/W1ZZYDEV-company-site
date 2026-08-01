import { NormalizedCountry } from '../constants/routing-constants.js';
import { CountryNormalizer } from './CountryNormalizer.js';

export class HeaderServerCountryResolver {
  constructor({ config, normalizer = new CountryNormalizer() }) {
    this.config = config;
    this.normalizer = normalizer;
  }

  resolve(metadata = {}) {
    const trustedProxy = this.config.get('routing.trustedProxy');
    if (!trustedProxy?.enabled || !trustedProxy.countryHeader) return unknown('trusted_proxy_disabled');
    const headers = normalizeHeaders(metadata.headers || {});
    const raw = headers[String(trustedProxy.countryHeader).toLowerCase()];
    const countryCode = this.normalizer.normalize(raw);
    return {
      countryCode,
      source: trustedProxy.provider || trustedProxy.countryHeader,
      trusted: countryCode !== NormalizedCountry.UNKNOWN,
      resolvedAt: new Date().toISOString()
    };
  }
}

export class StaticServerCountryResolver {
  constructor(countryCode = NormalizedCountry.UNKNOWN) {
    this.countryCode = countryCode;
  }

  resolve() {
    return {
      countryCode: this.countryCode,
      source: 'static_test',
      trusted: this.countryCode !== NormalizedCountry.UNKNOWN,
      resolvedAt: new Date().toISOString()
    };
  }
}

function unknown(source) {
  return { countryCode: NormalizedCountry.UNKNOWN, source, trusted: false, resolvedAt: new Date().toISOString() };
}

function normalizeHeaders(headers) {
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), String(value || '')]));
}
