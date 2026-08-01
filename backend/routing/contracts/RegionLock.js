import { DataRegion } from '../constants/routing-constants.js';

const resourceTypes = Object.freeze(['conversation', 'lead', 'support_ticket', 'client_account', 'review', 'privacy_request', 'attachment']);

export class RegionLock {
  constructor({ resourceType, publicResourceToken, region, createdAt = new Date().toISOString(), policyVersion }) {
    if (!resourceTypes.includes(resourceType)) throw new Error('Unsupported resource type for region lock');
    if (![DataRegion.RU, DataRegion.INTERNATIONAL].includes(region)) throw new Error('Invalid region lock region');
    this.resourceType = resourceType;
    this.publicResourceToken = publicResourceToken;
    this.region = region;
    this.createdAt = createdAt;
    this.policyVersion = policyVersion;
  }

  toSafeLogFields() {
    return {
      resourceType: this.resourceType,
      region: this.region,
      policyVersion: this.policyVersion
    };
  }
}

export const REGION_LOCK_RESOURCE_TYPES = resourceTypes;
