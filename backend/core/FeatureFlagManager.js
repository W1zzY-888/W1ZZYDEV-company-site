import { DEFAULT_FEATURE_FLAGS } from '../config/defaults.js';

export class FeatureFlagManager {
  constructor(flags = DEFAULT_FEATURE_FLAGS) {
    this.flags = Object.freeze({ ...DEFAULT_FEATURE_FLAGS, ...flags });
  }

  isEnabled(flagName) {
    return this.flags[flagName] === true;
  }

  snapshot() {
    return { ...this.flags };
  }
}
