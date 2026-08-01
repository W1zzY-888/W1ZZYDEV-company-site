/**
 * @typedef {object} LeadDTO
 * @property {string} publicToken
 * @property {string} country
 * @property {'RU'|'INTERNATIONAL'} region
 * @property {string} name
 * @property {'EMAIL'|'PHONE'|'TELEGRAM'|'WHATSAPP'|'INSTAGRAM'|'OTHER'} contactType
 * @property {string} contactValue
 * @property {string} message
 * @property {'NEW'|'IN_PROGRESS'|'WAITING_CLIENT'|'COMPLETED'|'CLOSED'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} consentId
 * @property {number} attachmentsCount
 * @property {string} source
 * @property {string} language
 * @property {object} metadata
 *
 * @typedef {object} LeadCreateInput
 * @property {string} selectedCountry
 * @property {string} name
 * @property {string} contactType
 * @property {string} contactValue
 * @property {string} message
 * @property {string} consentId
 * @property {number=} attachmentsCount
 * @property {string=} source
 * @property {string=} language
 * @property {object=} metadata
 */

export const LEAD_CONTRACTS_READY = true;
