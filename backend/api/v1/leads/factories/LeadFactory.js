import { randomBytes, randomUUID } from 'node:crypto';
import { LeadStatus } from '../types/LeadTypes.js';

export class LeadFactory {
  create({ input, region, country, routingResult = {} }) {
    const now = new Date().toISOString();
    return {
      id: randomUUID(),
      publicToken: createPublicToken(),
      country,
      region,
      name: input.name,
      contactType: input.contactType,
      contactValue: input.contactValue,
      message: input.message,
      status: LeadStatus.NEW,
      createdAt: now,
      updatedAt: now,
      consentId: input.consentId,
      attachmentsCount: input.attachmentsCount || 0,
      source: input.source || 'WEBSITE',
      language: input.language || 'ru',
      metadata: sanitizeMetadata(input.metadata),
      clientRequestId: input.clientRequestId || '',
      routingPolicyVersion: routingResult.routingPolicyVersion || '',
      routingReason: routingResult.reason || '',
      routingConfidence: routingResult.confidence || ''
    };
  }
}

function createPublicToken() {
  return `lead_${randomBytes(24).toString('base64url')}`;
}

function sanitizeMetadata(metadata) {
  const allowed = new Set(['campaign', 'page', 'referrerCategory', 'formId', 'utmSource', 'utmMedium', 'utmCampaign', 'legacyResult', 'originalCountryCode']);
  if (!metadata || Object.getPrototypeOf(metadata) !== Object.prototype) return {};
  return Object.fromEntries(Object.entries(metadata).filter(([key, value]) => allowed.has(key) && ['string', 'number', 'boolean'].includes(typeof value)));
}
