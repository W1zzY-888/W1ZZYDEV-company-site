import { DataRegion, LocaleClassification, NormalizedCountry, RoutingDecisionReason, ROUTING_POLICY_VERSION } from '../constants/routing-constants.js';
import { CountryNormalizer } from '../services/CountryNormalizer.js';
import { LocaleClassifier } from '../services/LocaleClassifier.js';
import { PhoneCountryClassifier } from '../services/PhoneCountryClassifier.js';
import { RoutingConflictDetector } from '../services/RoutingConflictDetector.js';
import { RoutingPolicy202607V1 } from '../policies/RoutingPolicy202607V1.js';
import { RegionLock } from '../contracts/RegionLock.js';
import { assert, assertEqual } from './assert.js';

const policy = new RoutingPolicy202607V1();
const decide = input => policy.decide(input);

assertEqual(decide({ existingResourceRegion: DataRegion.RU, selectedCountry: 'US' }).region, DataRegion.RU, 'existing RU lock wins');
assertEqual(decide({ existingResourceRegion: DataRegion.INTERNATIONAL, selectedCountry: 'RU', serverCountryCode: 'RU' }).region, DataRegion.INTERNATIONAL, 'existing international lock wins');
assertEqual(decide({ selectedCountry: 'Россия' }).region, DataRegion.RU, 'Russian country name routes RU');
assertEqual(decide({ selectedCountry: 'Russia' }).region, DataRegion.RU, 'English Russia routes RU');
assertEqual(decide({ selectedCountry: 'RU' }).reason, RoutingDecisionReason.USER_SELECTED_RUSSIA, 'RU code reason');
assertEqual(decide({ serverCountryCode: 'RU' }).reason, RoutingDecisionReason.SERVER_IP_RUSSIA, 'server RU reason');
assertEqual(decide({ selectedCountry: 'US', serverCountryCode: 'RU' }).region, DataRegion.RU, 'US selected and RU server routes RU');
assertEqual(decide({ selectedCountry: 'RU', serverCountryCode: 'US' }).region, DataRegion.RU, 'RU selected and US server routes RU');
assertEqual(decide({ phone: '+7 900 000 00 00' }).reason, RoutingDecisionReason.PHONE_CODE_RUSSIA, 'plus 7 routes RU without KZ');
assert(decide({ phone: '+7 700 000 00 00', selectedCountry: 'KZ', locale: 'en-US' }).reason !== RoutingDecisionReason.PHONE_CODE_RUSSIA, 'KZ selected avoids phone Russia reason');
assertEqual(decide({ selectedCountry: 'US', serverCountryCode: 'US' }).region, DataRegion.INTERNATIONAL, 'confirmed US routes international');
assertEqual(decide({ selectedCountry: 'Germany', serverCountryCode: 'DE' }).region, DataRegion.INTERNATIONAL, 'other country routes international');
assertEqual(decide({ locale: 'ru-RU' }).region, DataRegion.RU, 'Russian locale default routes RU');
assertEqual(decide({ locale: 'en-US' }).region, DataRegion.INTERNATIONAL, 'English locale default routes international');
assertEqual(decide({ locale: 'en' }).reason, RoutingDecisionReason.GLOBAL_DEFAULT, 'empty English default global');
assertEqual(decide('broken').reason, RoutingDecisionReason.INVALID_INPUT_SAFE_RU, 'damaged input safe fallback');

const locked = decide({ existingResourceRegion: DataRegion.RU, selectedCountry: 'US', serverCountryCode: 'US' });
assertEqual(locked.immutable, true, 'existing resource route is immutable');
assertEqual(decide({ routeRegion: 'INTERNATIONAL', locale: 'ru' }).region, DataRegion.RU, 'client routeRegion is not trusted');
assertEqual(decide({ selectedCountry: 'US', serverCountryCode: 'RU' }).reason, RoutingDecisionReason.SERVER_IP_RUSSIA, 'server RU has priority before conflict');
assertEqual(new CountryNormalizer().normalize('RUS'), NormalizedCountry.RU, 'RUS normalizes RU');
assertEqual(new CountryNormalizer().normalize('США'), NormalizedCountry.US, 'Cyrillic USA normalizes US');
assertEqual(new CountryNormalizer().normalize('KAZ'), NormalizedCountry.KZ, 'KAZ normalizes KZ');
assertEqual(new LocaleClassifier().classify('ru_RU'), LocaleClassification.RUSSIAN, 'ru underscore locale');
assertEqual(new LocaleClassifier().classify('en-US'), LocaleClassification.ENGLISH, 'en hyphen locale');
assertEqual(new RoutingConflictDetector().detect(policy.evaluateSignals({ selectedCountry: 'Other', phone: '+7' })).conflict, true, 'strong signal conflict detected');
assertEqual(decide({ selectedCountry: 'US', serverCountryCode: 'US', locale: 'ru-RU' }).region, DataRegion.INTERNATIONAL, 'locale does not override confirmed US');
assertEqual(decide({ selectedCountry: 'US' }).routingPolicyVersion, ROUTING_POLICY_VERSION, 'policy version included');
assertEqual(decide({ selectedCountry: 'USA' }).evaluatedSignals.selectedCountryCode, NormalizedCountry.US, 'USA normalization in result');
assertEqual(new PhoneCountryClassifier().classify('abc'), 'INVALID', 'malformed phone invalid');
assertEqual(new RegionLock({ resourceType: 'conversation', publicResourceToken: 'opaque', region: DataRegion.RU, policyVersion: ROUTING_POLICY_VERSION }).region, DataRegion.RU, 'region lock contract');

console.log('routing-unit.test: ok');
