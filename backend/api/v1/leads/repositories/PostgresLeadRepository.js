import { ConflictError, InfrastructureError } from '../../../../core/errors.js';
import { LeadNotFoundError } from '../errors/LeadErrors.js';
import { LeadRepository } from './LeadRepository.js';

export class PostgresLeadRepository extends LeadRepository {
  constructor({ databaseProvider, tokenHasher, encryptionProvider, region }) {
    super();
    this.databaseProvider = databaseProvider;
    this.tokenHasher = tokenHasher;
    this.encryptionProvider = encryptionProvider;
    this.region = region;
  }

  async create(lead) {
    if (lead.clientRequestId) {
      const existing = await this.findByClientRequestId(lead.clientRequestId, lead.region);
      if (existing) return existing;
    }
    const publicTokenHash = this.tokenHasher.hash(lead.publicToken);
    return this.databaseProvider.transaction(async tx => {
      const row = await this.insertLead(tx, lead, publicTokenHash);
      return this.fromRow(row, lead.publicToken);
    });
  }

  async insertLead(tx, lead, publicTokenHash) {
    const sql = `INSERT INTO leads (
      id, public_token_hash, region, country, name, contact_type, contact_value, message, status,
      consent_id, attachments_count, source, language, metadata, routing_policy_version,
      routing_reason, routing_confidence, client_request_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    RETURNING *`;
    const params = [
      lead.id, publicTokenHash, lead.region, lead.country, lead.name, lead.contactType, lead.contactValue, lead.message,
      lead.status, lead.consentId, lead.attachmentsCount, lead.source, lead.language, JSON.stringify(lead.metadata || {}),
      lead.routingPolicyVersion || '', lead.routingReason || '', lead.routingConfidence || '', lead.clientRequestId || null
    ];
    try {
      const result = await tx.query(sql, params);
      return result.rows[0];
    } catch (error) {
      if (String(error?.code) === '23505') throw new ConflictError('Lead token collision');
      throw new InfrastructureError('Lead persistence failed');
    }
  }

  async findByClientRequestId(clientRequestId, region) {
    const result = await this.databaseProvider.query(
      'SELECT * FROM leads WHERE client_request_id = $1 AND region = $2 AND deleted_at IS NULL LIMIT 1',
      [clientRequestId, region]
    );
    return result.rows[0] ? this.fromRow(result.rows[0], result.rows[0].public_token || '') : null;
  }

  async findByPublicToken(publicToken) {
    const publicTokenHash = this.tokenHasher.hash(publicToken);
    const result = await this.databaseProvider.query('SELECT * FROM leads WHERE public_token_hash = $1 AND deleted_at IS NULL LIMIT 1', [publicTokenHash]);
    return result.rows[0] ? this.fromRow(result.rows[0], publicToken) : null;
  }

  async existsByPublicToken(publicToken) {
    const publicTokenHash = this.tokenHasher.hash(publicToken);
    const result = await this.databaseProvider.query('SELECT 1 FROM leads WHERE public_token_hash = $1 AND deleted_at IS NULL LIMIT 1', [publicTokenHash]);
    return result.rowCount > 0;
  }

  async findById(id) {
    const result = await this.databaseProvider.query('SELECT * FROM leads WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ? this.fromRow(result.rows[0], '') : null;
  }

  async updateByPublicToken(publicToken, patch) {
    if (patch.region) throw new InfrastructureError('Lead region is immutable');
    const publicTokenHash = this.tokenHasher.hash(publicToken);
    const result = await this.databaseProvider.query(
      'UPDATE leads SET status = COALESCE($2, status), message = COALESCE($3, message), metadata = COALESCE($4, metadata), updated_at = now() WHERE public_token_hash = $1 AND deleted_at IS NULL RETURNING *',
      [publicTokenHash, patch.status || null, patch.message || null, patch.metadata ? JSON.stringify(patch.metadata) : null]
    );
    if (!result.rows[0]) return null;
    return this.fromRow(result.rows[0], publicToken);
  }

  async deleteByPublicToken(publicToken) { return this.softDelete(publicToken); }

  async softDelete(publicToken) {
    const publicTokenHash = this.tokenHasher.hash(publicToken);
    const result = await this.databaseProvider.query('UPDATE leads SET deleted_at = COALESCE(deleted_at, now()), updated_at = now(), status = $2 WHERE public_token_hash = $1 RETURNING id', [publicTokenHash, 'CLOSED']);
    return result.rowCount > 0;
  }

  async hardDelete(publicToken) {
    const publicTokenHash = this.tokenHasher.hash(publicToken);
    const result = await this.databaseProvider.query('DELETE FROM leads WHERE public_token_hash = $1', [publicTokenHash]);
    return result.rowCount > 0;
  }

  async health() { return this.databaseProvider.health(); }

  fromRow(row, publicToken) {
    return {
      id: row.id,
      publicToken,
      country: row.country,
      region: row.region,
      name: row.name,
      contactType: row.contact_type,
      contactValue: row.contact_value,
      message: row.message,
      status: row.status,
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at),
      deletedAt: row.deleted_at ? toIso(row.deleted_at) : null,
      consentId: row.consent_id,
      attachmentsCount: row.attachments_count,
      source: row.source,
      language: row.language,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : row.metadata || {},
      clientRequestId: row.client_request_id || '',
      routingPolicyVersion: row.routing_policy_version,
      routingReason: row.routing_reason,
      routingConfidence: row.routing_confidence
    };
  }
}

function toIso(value) {
  return value instanceof Date ? value.toISOString() : String(value);
}
