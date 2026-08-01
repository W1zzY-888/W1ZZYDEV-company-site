import { DEFAULT_CONFIG } from '../config/defaults.js';

export class Config {
  constructor(values = {}) {
    this.values = deepFreeze(mergeConfig(DEFAULT_CONFIG, values));
  }

  get(path, fallback = undefined) {
    return path.split('.').reduce((current, key) => current?.[key], this.values) ?? fallback;
  }

  toJSON() {
    return this.values;
  }
}

function mergeConfig(base, override) {
  const output = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    output[key] = isPlainObject(value) && isPlainObject(base[key])
      ? mergeConfig(base[key], value)
      : value;
  }
  return output;
}

function isPlainObject(value) {
  return Boolean(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function deepFreeze(value) {
  if (!isPlainObject(value) && !Array.isArray(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}
