import { LeadRepository } from './LeadRepository.js';

export class InMemoryLeadRepository extends LeadRepository {
  constructor() {
    super();
    this.records = new Map();
  }

  async create(lead) {
    if (lead.clientRequestId) {
      const existing = await this.findByClientRequestId(lead.clientRequestId, lead.region);
      if (existing) return existing;
    }
    this.records.set(lead.publicToken, { ...lead });
    return { ...lead };
  }

  async findByClientRequestId(clientRequestId, region) {
    const lead = [...this.records.values()].find(item => item.clientRequestId === clientRequestId && item.region === region && !item.deletedAt);
    return lead ? { ...lead } : null;
  }

  async findByPublicToken(publicToken) {
    const lead = this.records.get(publicToken);
    return lead && !lead.deletedAt ? { ...lead } : null;
  }
  async existsByPublicToken(publicToken) { return this.records.has(publicToken); }
  async findById(id) { return [...this.records.values()].find(lead => lead.id === id) || null; }

  async updateByPublicToken(publicToken, patch) {
    const lead = this.records.get(publicToken);
    if (!lead) return null;
    const updated = { ...lead, ...patch, publicToken: lead.publicToken, id: lead.id, region: lead.region, createdAt: lead.createdAt, updatedAt: new Date().toISOString() };
    this.records.set(publicToken, updated);
    return { ...updated };
  }

  async deleteByPublicToken(publicToken) {
    return this.softDelete(publicToken);
  }

  async softDelete(publicToken) {
    const lead = this.records.get(publicToken);
    if (!lead) return false;
    this.records.set(publicToken, { ...lead, deletedAt: new Date().toISOString(), status: 'CLOSED', updatedAt: new Date().toISOString() });
    return true;
  }

  async hardDelete(publicToken) {
    return this.records.delete(publicToken);
  }

  async health() {
    return { status: 'ok', latencyBucket: 'memory', checkedAt: new Date().toISOString(), region: this.region || 'MEMORY' };
  }

  clear() {
    this.records.clear();
  }
}
