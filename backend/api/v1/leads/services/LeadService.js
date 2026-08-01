import { LeadNotFoundError } from '../errors/LeadErrors.js';

export class LeadService {
  constructor({ repository, validator, routingProvider, factory, mapper, logger }) {
    this.repositoryResolver = repository?.resolve ? repository : { resolve: () => repository };
    this.validator = validator;
    this.routingProvider = routingProvider;
    this.factory = factory;
    this.mapper = mapper;
    this.logger = logger;
  }

  async create(input, context) {
    const normalized = this.validator.validateCreate(input);
    const routingResult = this.routingProvider.resolve({
      selectedCountry: normalized.selectedCountry,
      serverCountryCode: normalized.serverCountryCode,
      phone: normalized.phone,
      locale: normalized.locale,
      requestId: context?.requestId
    }, context);
    if (normalized.clientRequestId) {
      const existing = await this.repositoryResolver.resolve(routingResult.region).findByClientRequestId(normalized.clientRequestId, routingResult.region);
      if (existing) {
        this.log('lead.idempotent_replay', context, existing.region, existing.status, 'replayed', existing.routingPolicyVersion);
        return this.mapper.toDTO(existing);
      }
    }
    const lead = this.factory.create({ input: normalized, region: routingResult.region, country: normalized.selectedCountry, routingResult });
    const created = await this.repositoryResolver.resolve(routingResult.region).create(lead);
    this.log('lead.created', context, created.region, created.status, 'created', routingResult.routingPolicyVersion);
    return this.mapper.toDTO(created);
  }

  async get(publicToken, context) {
    const token = this.validator.validatePublicToken(publicToken);
    const lead = await this.findInKnownRegions(token);
    if (!lead) throw new LeadNotFoundError();
    this.log('lead.get', context, lead.region, lead.status, 'found');
    return this.mapper.toDTO(lead);
  }

  async update(publicToken, input, context) {
    const token = this.validator.validatePublicToken(publicToken);
    const patch = this.validator.validateUpdate(input);
    const existing = await this.findInKnownRegions(token);
    if (!existing) throw new LeadNotFoundError();
    const updated = await this.repositoryResolver.resolve(existing.region).updateByPublicToken(token, patch);
    if (!updated) throw new LeadNotFoundError();
    this.log('lead.updated', context, updated.region, updated.status, 'updated', updated.routingPolicyVersion);
    return this.mapper.toDTO(updated);
  }

  async delete(publicToken, context) {
    const token = this.validator.validatePublicToken(publicToken);
    const existing = await this.findInKnownRegions(token);
    if (!existing) throw new LeadNotFoundError();
    await this.repositoryResolver.resolve(existing.region).deleteByPublicToken(token);
    this.log('lead.deleted', context, existing.region, existing.status, 'deleted', existing.routingPolicyVersion);
    return { deleted: true, publicToken: token };
  }

  log(event, context, region, status, result, routingPolicyVersion = '') {
    this.logger?.info(event, {
      requestId: context?.requestId || '',
      region,
      status,
      result,
      routingPolicyVersion
    });
  }

  async findInKnownRegions(publicToken) {
    for (const region of ['RU', 'INTERNATIONAL']) {
      try {
        const lead = await this.repositoryResolver.resolve(region).findByPublicToken(publicToken);
        if (lead) return lead;
      } catch {
        continue;
      }
    }
    return null;
  }
}
