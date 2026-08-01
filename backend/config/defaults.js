export const APP_VERSION = '0.1.0';
export const API_PREFIX = '/api';
export const SUPPORTED_API_VERSIONS = Object.freeze(['v1']);

export const DEFAULT_FEATURE_FLAGS = Object.freeze({
  DUAL_REGION_ENABLED: false,
  RU_DATA_ROUTE_ENABLED: false,
  DIRECT_SUPABASE_LEGACY_MODE: true,
  NEW_BACKEND_ENABLED: false,
  ADMIN_AGGREGATION_ENABLED: false,
  ROUTING_PREVIEW_ENDPOINT_ENABLED: false,
  ALLOW_ROUTING_PREVIEW_IN_PRODUCTION: false,
  LEAD_API_ENABLED: false
});

export const DEFAULT_CONFIG = Object.freeze({
  appName: 'W1ZZYDEV Backend Core',
  version: APP_VERSION,
  environment: 'development',
  apiPrefix: API_PREFIX,
  supportedApiVersions: SUPPORTED_API_VERSIONS,
  featureFlags: DEFAULT_FEATURE_FLAGS,
  routing: {
    policyVersion: '2026-07-v1',
    defaultRuForRussianLocale: true,
    conflictSafeRegion: 'RU',
    debug: false,
    trustedProxy: {
      enabled: false,
      countryHeader: '',
      provider: ''
    }
  },
  database: {
    leadRepositoryMode: 'in_memory',
    regions: {
      RU: { mode: 'disabled', url: '', ssl: true },
      INTERNATIONAL: { mode: 'disabled', url: '', ssl: true }
    },
    connectTimeoutMs: 3000,
    queryTimeoutMs: 5000,
    poolMin: 0,
    poolMax: 5
  },
  security: {
    publicTokenHashSecret: '',
    publicTokenHashVersion: 'v1',
    fieldEncryptionMode: 'disabled'
  },
  logging: {
    level: 'info',
    redactKeys: ['name', 'email', 'phone', 'contact', 'message', 'body', 'password', 'token', 'authorization', 'cookie', 'fileName', 'ip', 'userAgent']
  }
});
