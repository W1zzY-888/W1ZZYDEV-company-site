import { PolicyRoutingProvider } from '../../../../routing/providers/PolicyRoutingProvider.js';
import { Config } from '../../../../core/Config.js';
import { Logger } from '../../../../core/Logger.js';
import { LeadFactory } from '../factories/LeadFactory.js';
import { LeadMapper } from '../mappers/LeadMapper.js';
import { InMemoryLeadRepository } from '../repositories/InMemoryLeadRepository.js';
import { LeadService } from '../services/LeadService.js';
import { ContactType, LeadStatus } from '../types/LeadTypes.js';
import { LeadValidator } from '../validation/LeadValidator.js';
import { assert, assertEqual, assertRejects } from './assert.js';

const valid = {
  selectedCountry: 'Russia',
  serverCountryCode: 'US',
  phone: '+7 900 000 00 00',
  locale: 'ru-RU',
  name: 'Max',
  contactType: ContactType.EMAIL,
  contactValue: 'max@example.test',
  message: 'Need a website',
  consentId: 'consent-1',
  attachmentsCount: 0,
  source: 'WEBSITE',
  language: 'ru',
  metadata: { campaign: 'test' }
};

const validator = new LeadValidator();
const normalized = validator.validateCreate(valid);
assertEqual(normalized.name, 'Max', 'valid name accepted');
assertEqual(normalized.contactType, ContactType.EMAIL, 'valid contact type accepted');
assertEqual(normalized.contactValue, 'max@example.test', 'valid contact accepted');
assertEqual(normalized.selectedCountry, 'Russia', 'valid country accepted');
assertEqual(normalized.message, 'Need a website', 'valid message accepted');
assertEqual(normalized.consentId, 'consent-1', 'valid consent accepted');
assertEqual(normalized.attachmentsCount, 0, 'attachments count accepted');
assertEqual(normalized.language, 'ru', 'language accepted');
assertEqual(normalized.metadata.campaign, 'test', 'metadata accepted');

await assertRejects(() => validator.validateCreate({ ...valid, name: '' }), 'empty name rejected');
await assertRejects(() => validator.validateCreate({ ...valid, name: 'x'.repeat(81) }), 'long name rejected');
await assertRejects(() => validator.validateCreate({ ...valid, contactType: 'BAD' }), 'bad contact type rejected');
await assertRejects(() => validator.validateCreate({ ...valid, contactValue: '' }), 'empty contact rejected');
await assertRejects(() => validator.validateCreate({ ...valid, selectedCountry: '' }), 'empty country rejected');
await assertRejects(() => validator.validateCreate({ ...valid, message: '' }), 'empty message rejected');
await assertRejects(() => validator.validateCreate({ ...valid, consentId: '' }), 'empty consent rejected');
await assertRejects(() => validator.validateCreate({ ...valid, message: '<script>alert(1)</script>' }), 'xss message rejected');
await assertRejects(() => validator.validateCreate({ ...valid, name: '<b>Max</b>' }), 'xss name rejected');
await assertRejects(() => validator.validateCreate({ ...valid, contactValue: 'javascript:alert(1)' }), 'xss contact rejected');
await assertRejects(() => validator.validateCreate({ ...valid, message: 'x'.repeat(3001) }), 'long message rejected');
await assertRejects(() => validator.validateCreate({ ...valid, attachmentsCount: 21 }), 'too many attachments rejected');
await assertRejects(() => validator.validateCreate({ ...valid, extra: true }), 'unexpected field rejected');
await assertRejects(() => validator.validateCreate(JSON.parse('{"__proto__":{"polluted":true}}')), 'prototype pollution rejected');
assertEqual({}.polluted, undefined, 'prototype not polluted');

const update = validator.validateUpdate({ status: LeadStatus.IN_PROGRESS, message: 'Updated' });
assertEqual(update.status, LeadStatus.IN_PROGRESS, 'valid update status accepted');
assertEqual(update.message, 'Updated', 'valid update message accepted');
await assertRejects(() => validator.validateUpdate({ status: 'BAD' }), 'bad status rejected');
await assertRejects(() => validator.validateUpdate({ message: '<img src=x>' }), 'xss update rejected');
await assertRejects(() => validator.validateUpdate({}), 'empty update rejected');
await assertRejects(() => validator.validatePublicToken('bad-token'), 'bad token rejected');

const lead = new LeadFactory().create({ input: normalized, region: 'RU', country: normalized.selectedCountry });
assert(lead.id, 'lead id created');
assert(lead.publicToken.startsWith('lead_'), 'public token prefix');
assert(lead.publicToken !== lead.id, 'public token is not id');
assertEqual(lead.status, LeadStatus.NEW, 'new lead status');
assertEqual(lead.region, 'RU', 'lead region set');
assertEqual(lead.attachmentsCount, 0, 'lead attachments set');
assert(lead.createdAt && lead.updatedAt, 'timestamps set');

const dto = new LeadMapper().toDTO(lead);
assert(!('id' in dto), 'DTO hides id');
assertEqual(dto.publicToken, lead.publicToken, 'DTO exposes public token');

const repository = new InMemoryLeadRepository();
await repository.create(lead);
assertEqual((await repository.findByPublicToken(lead.publicToken)).publicToken, lead.publicToken, 'repository find');
assertEqual((await repository.updateByPublicToken(lead.publicToken, { status: LeadStatus.CLOSED })).status, LeadStatus.CLOSED, 'repository update');
assertEqual(await repository.deleteByPublicToken(lead.publicToken), true, 'repository delete');
assertEqual(await repository.findByPublicToken(lead.publicToken), null, 'repository delete removes');

const entries = [];
const logger = new Logger({ sink: { info: line => entries.push(line), error: line => entries.push(line), warn: line => entries.push(line), debug: line => entries.push(line) }, redactKeys: [] });
const service = new LeadService({
  repository: new InMemoryLeadRepository(),
  validator,
  routingProvider: new PolicyRoutingProvider({ config: new Config(), logger }),
  factory: new LeadFactory(),
  mapper: new LeadMapper(),
  logger
});
const created = await service.create(valid, { requestId: 'req-lead-unit' });
assertEqual(created.region, 'RU', 'service uses routing provider');
assert(!entries.join('\n').includes('Max'), 'logger does not include name');
assert(!entries.join('\n').includes('max@example.test'), 'logger does not include email');
assert(!entries.join('\n').includes('+7'), 'logger does not include phone');
assert(!entries.join('\n').includes('Need a website'), 'logger does not include message');
assert(entries.join('\n').includes('req-lead-unit'), 'logger includes requestId');

console.log('lead-unit.test: ok');
