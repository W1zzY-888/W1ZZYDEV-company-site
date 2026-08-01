import { DEFAULT_CONFIG } from './defaults.js';

const booleanValues = Object.freeze({
  true: true,
  false: false,
  '1': true,
  '0': false,
  yes: true,
  no: false
});

export class EnvironmentLoader {
  constructor(env = process.env) {
    this.env = env;
  }

  getString(key, fallback = '') {
    const value = this.env[key];
    return value == null || value === '' ? fallback : String(value);
  }

  getBoolean(key, fallback = false) {
    const raw = this.env[key];
    if (raw == null || raw === '') return fallback;
    return booleanValues[String(raw).trim().toLowerCase()] ?? fallback;
  }

  load() {
    return {
      ...DEFAULT_CONFIG,
      environment: this.getString('NODE_ENV', DEFAULT_CONFIG.environment),
      featureFlags: {
        ...DEFAULT_CONFIG.featureFlags,
        DUAL_REGION_ENABLED: this.getBoolean('DUAL_REGION_ENABLED', DEFAULT_CONFIG.featureFlags.DUAL_REGION_ENABLED),
        RU_DATA_ROUTE_ENABLED: this.getBoolean('RU_DATA_ROUTE_ENABLED', DEFAULT_CONFIG.featureFlags.RU_DATA_ROUTE_ENABLED),
        DIRECT_SUPABASE_LEGACY_MODE: this.getBoolean('DIRECT_SUPABASE_LEGACY_MODE', DEFAULT_CONFIG.featureFlags.DIRECT_SUPABASE_LEGACY_MODE),
        NEW_BACKEND_ENABLED: this.getBoolean('NEW_BACKEND_ENABLED', DEFAULT_CONFIG.featureFlags.NEW_BACKEND_ENABLED),
        ADMIN_AGGREGATION_ENABLED: this.getBoolean('ADMIN_AGGREGATION_ENABLED', DEFAULT_CONFIG.featureFlags.ADMIN_AGGREGATION_ENABLED),
        ROUTING_PREVIEW_ENDPOINT_ENABLED: this.getBoolean('ROUTING_PREVIEW_ENDPOINT_ENABLED', DEFAULT_CONFIG.featureFlags.ROUTING_PREVIEW_ENDPOINT_ENABLED),
        ALLOW_ROUTING_PREVIEW_IN_PRODUCTION: this.getBoolean('ALLOW_ROUTING_PREVIEW_IN_PRODUCTION', DEFAULT_CONFIG.featureFlags.ALLOW_ROUTING_PREVIEW_IN_PRODUCTION),
        LEAD_API_ENABLED: this.getBoolean('LEAD_API_ENABLED', DEFAULT_CONFIG.featureFlags.LEAD_API_ENABLED)
      },
      routing: {
        ...DEFAULT_CONFIG.routing,
        policyVersion: this.getString('ROUTING_POLICY_VERSION', DEFAULT_CONFIG.routing.policyVersion),
        defaultRuForRussianLocale: this.getBoolean('ROUTING_DEFAULT_RU_FOR_RUSSIAN_LOCALE', DEFAULT_CONFIG.routing.defaultRuForRussianLocale),
        conflictSafeRegion: this.getString('ROUTING_CONFLICT_SAFE_REGION', DEFAULT_CONFIG.routing.conflictSafeRegion),
        debug: this.getBoolean('ROUTING_DEBUG', DEFAULT_CONFIG.routing.debug),
        trustedProxy: {
          enabled: this.getBoolean('TRUSTED_PROXY_ENABLED', DEFAULT_CONFIG.routing.trustedProxy.enabled),
          countryHeader: this.getString('TRUSTED_COUNTRY_HEADER', DEFAULT_CONFIG.routing.trustedProxy.countryHeader),
          provider: this.getString('TRUSTED_PROXY_PROVIDER', DEFAULT_CONFIG.routing.trustedProxy.provider)
        }
      },
      database: {
        leadRepositoryMode: this.getString('LEAD_REPOSITORY_MODE', DEFAULT_CONFIG.database.leadRepositoryMode),
        regions: {
          RU: {
            mode: this.getString('RU_DATABASE_MODE', DEFAULT_CONFIG.database.regions.RU.mode),
            url: this.getString('RU_DATABASE_URL', ''),
            ssl: this.getBoolean('RU_DATABASE_SSL', DEFAULT_CONFIG.database.regions.RU.ssl)
          },
          INTERNATIONAL: {
            mode: this.getString('INTERNATIONAL_DATABASE_MODE', DEFAULT_CONFIG.database.regions.INTERNATIONAL.mode),
            url: this.getString('INTERNATIONAL_DATABASE_URL', ''),
            ssl: this.getBoolean('INTERNATIONAL_DATABASE_SSL', DEFAULT_CONFIG.database.regions.INTERNATIONAL.ssl)
          }
        },
        connectTimeoutMs: Number(this.getString('DATABASE_CONNECT_TIMEOUT_MS', DEFAULT_CONFIG.database.connectTimeoutMs)),
        queryTimeoutMs: Number(this.getString('DATABASE_QUERY_TIMEOUT_MS', DEFAULT_CONFIG.database.queryTimeoutMs)),
        poolMin: Number(this.getString('DATABASE_POOL_MIN', DEFAULT_CONFIG.database.poolMin)),
        poolMax: Number(this.getString('DATABASE_POOL_MAX', DEFAULT_CONFIG.database.poolMax))
      },
      security: {
        publicTokenHashSecret: this.getString('PUBLIC_TOKEN_HASH_SECRET', ''),
        publicTokenHashVersion: this.getString('PUBLIC_TOKEN_HASH_VERSION', DEFAULT_CONFIG.security.publicTokenHashVersion),
        fieldEncryptionMode: this.getString('FIELD_ENCRYPTION_MODE', DEFAULT_CONFIG.security.fieldEncryptionMode)
      }
    };
  }
}
