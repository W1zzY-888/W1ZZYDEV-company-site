/**
 * @typedef {'RU'|'INTERNATIONAL'|'LEGACY_SUPABASE'|'UNKNOWN'} RouteRegion
 * @typedef {'debug'|'info'|'warn'|'error'|'fatal'} LogLevel
 * @typedef {Record<'DUAL_REGION_ENABLED'|'RU_DATA_ROUTE_ENABLED'|'DIRECT_SUPABASE_LEGACY_MODE'|'NEW_BACKEND_ENABLED'|'ADMIN_AGGREGATION_ENABLED'|'ROUTING_PREVIEW_ENDPOINT_ENABLED'|'ALLOW_ROUTING_PREVIEW_IN_PRODUCTION'|'LEAD_API_ENABLED', boolean>} FeatureFlagSnapshot
 *
 * @typedef {object} RequestContext
 * @property {string} requestId
 * @property {string} timestamp
 * @property {string} ipHash
 * @property {string} country
 * @property {string} locale
 * @property {RouteRegion} routeRegion
 * @property {FeatureFlagSnapshot} featureFlags
 */

export const CONTRACT_TYPES_READY = true;
