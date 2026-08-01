/**
 * @typedef {import('../../types/contracts.js').RequestContext} RequestContext
 * @typedef {'RU'|'INTERNATIONAL'} DataRegion
 * @typedef {'HIGH'|'MEDIUM'|'LOW'} RoutingConfidence
 * @typedef {'EXISTING_RESOURCE_LOCK'|'USER_SELECTED_RUSSIA'|'SERVER_IP_RUSSIA'|'PHONE_CODE_RUSSIA'|'CONFLICT_SAFE_RU'|'RUSSIAN_LOCALE_DEFAULT'|'INTERNATIONAL_CONFIRMED'|'GLOBAL_DEFAULT'|'INVALID_INPUT_SAFE_RU'} RoutingDecisionReason
 *
 * @typedef {object} RoutingInput
 * @property {string=} selectedCountry
 * @property {string=} serverCountryCode
 * @property {string=} phone
 * @property {string=} locale
 * @property {DataRegion=} existingResourceRegion
 * @property {string=} existingResourceId
 * @property {string=} requestId
 *
 * @typedef {object} EvaluatedSignals
 * @property {'RU'|'US'|'KZ'|'OTHER'|'UNKNOWN'} selectedCountryCode
 * @property {'RU'|'US'|'KZ'|'OTHER'|'UNKNOWN'} serverCountryCode
 * @property {'RUSSIA_OR_KAZAKHSTAN_PREFIX'|'NON_RU_PREFIX'|'EMPTY'|'INVALID'} phoneCountryClassification
 * @property {'RUSSIAN'|'ENGLISH'|'OTHER'|'UNKNOWN'} localeClassification
 * @property {boolean} existingResourceRegionPresent
 *
 * @typedef {object} RoutingResult
 * @property {DataRegion} region
 * @property {RoutingConfidence} confidence
 * @property {RoutingDecisionReason} reason
 * @property {EvaluatedSignals} evaluatedSignals
 * @property {boolean} immutable
 * @property {string} decidedAt
 * @property {string} routingPolicyVersion
 */

export const ROUTING_TYPES_READY = true;
