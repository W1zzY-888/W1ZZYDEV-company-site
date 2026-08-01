import { Config } from '../../../../../core/Config.js';
import { InfrastructureError } from '../../../../../core/errors.js';
import { Logger } from '../../../../../core/Logger.js';
import { DisabledDatabaseProvider } from '../../../../../database/providers/DisabledDatabaseProvider.js';
import { PostgresDatabaseProvider } from '../../../../../database/providers/PostgresDatabaseProvider.js';
import { PolicyRoutingProvider } from '../../../../../routing/providers/PolicyRoutingProvider.js';
import { LeadFactory } from '../../factories/LeadFactory.js';
import { LeadMapper } from '../../mappers/LeadMapper.js';
import { InMemoryLeadRepository } from '../../repositories/InMemoryLeadRepository.js';
import { PostgresLeadRepository } from '../../repositories/PostgresLeadRepository.js';
import { RegionLeadRepositoryResolver } from '../../repositories/routing/RegionLeadRepositoryResolver.js';
import { DisabledFieldEncryptionProvider, NoOpFieldEncryptionProvider } from '../../security/FieldEncryptionProvider.js';
import { TokenHasher } from '../../security/TokenHasher.js';
import { LeadService } from '../../services/LeadService.js';
import { ContactType, LeadStatus } from '../../types/LeadTypes.js';
import { LeadValidator } from '../../validation/LeadValidator.js';
import { assert, assertEqual, assertRejects } from '../assert.js';

const secret = 'test-secret-pepper-with-enough-length';
const tokenHasher = new TokenHasher({ secret, version: 'v1' });
const input = {
  selectedCountry: 'Russia',
  serverCountryCode: 'US',
  phone: '+7 900 000 00 00',
  locale: 'ru-RU',
  name: 'Max',
  contactType: ContactType.EMAIL,
  contactValue: 'max@example.test',
  message: 'Need website',
  consentId: 'consent-1',
  metadata: { campaign: 'summer', page: 'contact' }
};

class FakePgClient {
  constructor() { this.rows = []; this.queries = []; }
  async query(sql, params = []) {
    this.queries.push({ sql, params });
    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 };
    if (sql.startsWith('INSERT')) {
      const row = toRow(params);
      this.rows.push(row);
      return { rows: [row], rowCount: 1 };
    }
    if (sql.startsWith('SELECT * FROM leads WHERE public_token_hash')) {
      const row = this.rows.find(item => item.public_token_hash === params[0] && !item.deleted_at);
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    }
    if (sql.startsWith('SELECT 1 FROM leads')) {
      const row = this.rows.find(item => item.public_token_hash === params[0] && !item.deleted_at);
      return { rows: row ? [{ ok: 1 }] : [], rowCount: row ? 1 : 0 };
    }
    if (sql.startsWith('SELECT * FROM leads WHERE id')) {
      const row = this.rows.find(item => item.id === params[0]);
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    }
    if (sql.startsWith('UPDATE leads SET status')) {
      const row = this.rows.find(item => item.public_token_hash === params[0] && !item.deleted_at);
      if (!row) return { rows: [], rowCount: 0 };
      row.status = params[1] || row.status;
      row.message = params[2] || row.message;
      row.metadata = params[3] || row.metadata;
      row.updated_at = new Date();
      return { rows: [row], rowCount: 1 };
    }
    if (sql.startsWith('UPDATE leads SET deleted_at')) {
      const row = this.rows.find(item => item.public_token_hash === params[0]);
      if (!row) return { rows: [], rowCount: 0 };
      row.deleted_at = row.deleted_at || new Date();
      row.status = 'CLOSED';
      return { rows: [{ id: row.id }], rowCount: 1 };
    }
    if (sql.startsWith('DELETE FROM leads')) {
      const before = this.rows.length;
      this.rows = this.rows.filter(item => item.public_token_hash !== params[0]);
      return { rows: [], rowCount: before - this.rows.length };
    }
    return { rows: [], rowCount: 0 };
  }
}

class RecordingRepository {
  constructor(region) { this.region = region; this.created = 0; this.items = new Map(); }
  async create(lead) { this.created += 1; this.items.set(lead.publicToken, lead); return lead; }
  async findByPublicToken(token) { return this.items.get(token) || null; }
  async updateByPublicToken(token, patch) { const item = this.items.get(token); if (!item) return null; const next = { ...item, ...patch }; this.items.set(token, next); return next; }
  async deleteByPublicToken(token) { return this.items.delete(token); }
  async health() { return { status: 'ok', latencyBucket: 'memory', checkedAt: new Date().toISOString(), region: this.region }; }
}

const memory = new InMemoryLeadRepository();
const lead = new LeadFactory().create({ input: new LeadValidator().validateCreate(input), region: 'RU', country: 'Russia', routingResult: { routingPolicyVersion: '2026-07-v1', reason: 'USER_SELECTED_RUSSIA', confidence: 'HIGH' } });
await memory.create(lead);
assertEqual(await memory.existsByPublicToken(lead.publicToken), true, 'InMemory exists by token');
assertEqual((await memory.findById(lead.id)).id, lead.id, 'InMemory find internal id');
assertEqual(await memory.softDelete(lead.publicToken), true, 'InMemory soft delete');
assertEqual((await memory.findById(lead.id)).deletedAt != null, true, 'InMemory soft delete marks deleted internally');
assertEqual(await memory.findByPublicToken(lead.publicToken), null, 'InMemory soft deleted lead hidden from public lookup');
assertEqual(await memory.hardDelete(lead.publicToken), true, 'InMemory hard delete');

const fakeClient = new FakePgClient();
const provider = new PostgresDatabaseProvider({
  region: 'RU',
  config: { url: 'postgres://staging.invalid/db', queryTimeoutMs: 1000, connectTimeoutMs: 1000 },
  client: fakeClient
});
const pgRepo = new PostgresLeadRepository({ databaseProvider: provider, tokenHasher, encryptionProvider: new NoOpFieldEncryptionProvider({ environment: 'test' }), region: 'RU' });
const created = await pgRepo.create(lead);
assertEqual(created.publicToken, lead.publicToken, 'Postgres returns plaintext token only from request');
assert(fakeClient.rows[0].public_token_hash.startsWith('v1:'), 'Postgres stores token hash');
assert(!JSON.stringify(fakeClient.rows[0]).includes(lead.publicToken), 'Postgres row does not store plaintext token');
assertEqual(await pgRepo.existsByPublicToken(lead.publicToken), true, 'Postgres exists by hashed token');
assertEqual((await pgRepo.findByPublicToken(lead.publicToken)).publicToken, lead.publicToken, 'Postgres find by public token via hash');
assertEqual(await pgRepo.findByPublicToken('lead_invalidbutlongenough000000000000'), null, 'invalid token does not find');
assertEqual((await pgRepo.findById(lead.id)).id, lead.id, 'Postgres find by internal id');
assertEqual((await pgRepo.updateByPublicToken(lead.publicToken, { status: LeadStatus.IN_PROGRESS })).status, LeadStatus.IN_PROGRESS, 'Postgres update status');
await assertRejects(() => pgRepo.updateByPublicToken(lead.publicToken, { region: 'INTERNATIONAL' }), 'Postgres region update blocked');
assertEqual(await pgRepo.softDelete(lead.publicToken), true, 'Postgres soft delete');
assertEqual(await pgRepo.findByPublicToken(lead.publicToken), null, 'deleted lead hidden from public lookup');
assertEqual(await pgRepo.hardDelete(lead.publicToken), true, 'Postgres hard delete');
assert(fakeClient.queries.every(query => query.params && Array.isArray(query.params)), 'SQL calls use params arrays');
assert(!fakeClient.queries.some(query => query.sql.includes('Need website')), 'SQL payload not interpolated');

const ruRepo = new RecordingRepository('RU');
const intlRepo = new RecordingRepository('INTERNATIONAL');
const resolver = new RegionLeadRepositoryResolver({ repositories: { RU: ruRepo, INTERNATIONAL: intlRepo } });
const service = new LeadService({
  repository: resolver,
  validator: new LeadValidator(),
  routingProvider: new PolicyRoutingProvider({ config: new Config(), logger: new Logger({ sink: quietSink() }) }),
  factory: new LeadFactory(),
  mapper: new LeadMapper(),
  logger: new Logger({ sink: quietSink() })
});
await service.create(input, { requestId: 'req-ru' });
assertEqual(ruRepo.created, 1, 'RU lead uses RU repository');
assertEqual(intlRepo.created, 0, 'RU lead does not use International repository');
await service.create({ ...input, selectedCountry: 'US', serverCountryCode: 'US', phone: '', locale: 'en-US' }, { requestId: 'req-intl' });
assertEqual(intlRepo.created, 1, 'International lead uses International repository');

const unavailableService = new LeadService({
  repository: new RegionLeadRepositoryResolver({ repositories: { INTERNATIONAL: intlRepo } }),
  validator: new LeadValidator(),
  routingProvider: new PolicyRoutingProvider({ config: new Config(), logger: new Logger({ sink: quietSink() }) }),
  factory: new LeadFactory(),
  mapper: new LeadMapper(),
  logger: new Logger({ sink: quietSink() })
});
await assertRejects(() => unavailableService.create(input, { requestId: 'req-missing-ru' }), 'RU unavailable fails without fallback');
assertEqual(intlRepo.created, 1, 'No cross-region fallback on unavailable RU');

await assertRejects(() => new TokenHasher({ secret: '', version: 'v1' }).hash('lead_token'), 'missing hash secret blocks token hashing');
await assertRejects(() => new NoOpFieldEncryptionProvider({ environment: 'production' }), 'noop encryption forbidden in production');
await assertRejects(() => new DisabledFieldEncryptionProvider().encrypt('value'), 'disabled encryption fail closed');
await assertRejects(() => new DisabledDatabaseProvider('RU').query('SELECT 1', []), 'disabled database provider unavailable');

const health = await resolver.health();
assertEqual(health.RU.region, 'RU', 'health includes RU region');
assertEqual(Object.keys(health.RU).includes('url'), false, 'health hides connection info');

const entries = [];
const sink = { info: line => entries.push(line), error: line => entries.push(line), warn: line => entries.push(line), debug: line => entries.push(line) };
await new LeadService({
  repository: new RegionLeadRepositoryResolver({ repositories: { RU: new RecordingRepository('RU'), INTERNATIONAL: new RecordingRepository('INTERNATIONAL') } }),
  validator: new LeadValidator(),
  routingProvider: new PolicyRoutingProvider({ config: new Config(), logger: new Logger({ sink }) }),
  factory: new LeadFactory(),
  mapper: new LeadMapper(),
  logger: new Logger({ sink })
}).create(input, { requestId: 'req-log' });
const logs = entries.join('\n');
assert(!logs.includes('Max'), 'logger does not get name');
assert(!logs.includes('max@example.test'), 'logger does not get contactValue');
assert(!logs.includes('Need website'), 'logger does not get message');
assert(!logs.includes('lead_'), 'logger does not get publicToken');

console.log('lead-persistence.test: ok');

function toRow(params) {
  return {
    id: params[0],
    public_token_hash: params[1],
    region: params[2],
    country: params[3],
    name: params[4],
    contact_type: params[5],
    contact_value: params[6],
    message: params[7],
    status: params[8],
    consent_id: params[9],
    attachments_count: params[10],
    source: params[11],
    language: params[12],
    metadata: params[13],
    routing_policy_version: params[14],
    routing_reason: params[15],
    routing_confidence: params[16],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null
  };
}

function quietSink() {
  return { info() {}, error() {}, warn() {}, debug() {} };
}
