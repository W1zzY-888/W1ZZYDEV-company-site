import { DataRegion, LocaleClassification, NormalizedCountry, PhoneCountryClassification, RoutingConfidence, RoutingDecisionReason, ROUTING_POLICY_VERSION } from '../constants/routing-constants.js';
import { CountryNormalizer } from '../services/CountryNormalizer.js';
import { LocaleClassifier } from '../services/LocaleClassifier.js';
import { PhoneCountryClassifier } from '../services/PhoneCountryClassifier.js';
import { RoutingConflictDetector } from '../services/RoutingConflictDetector.js';
import { RoutingInputValidator } from '../validation/RoutingInputValidator.js';

export class RoutingPolicy202607V1 {
  constructor({
    countryNormalizer = new CountryNormalizer(),
    phoneClassifier = new PhoneCountryClassifier(),
    localeClassifier = new LocaleClassifier(),
    conflictDetector = new RoutingConflictDetector(),
    validator = new RoutingInputValidator(),
    policyVersion = ROUTING_POLICY_VERSION
  } = {}) {
    this.countryNormalizer = countryNormalizer;
    this.phoneClassifier = phoneClassifier;
    this.localeClassifier = localeClassifier;
    this.conflictDetector = conflictDetector;
    this.validator = validator;
    this.policyVersion = policyVersion;
  }

  decide(input = {}) {
    const validation = this.validator.validate(input);
    if (!validation.ok) return this.result(DataRegion.RU, RoutingConfidence.LOW, RoutingDecisionReason.INVALID_INPUT_SAFE_RU, emptySignals(), false);
    const value = validation.value;
    const signals = this.evaluateSignals(value);

    if (value.existingResourceRegion) {
      return this.result(value.existingResourceRegion, RoutingConfidence.HIGH, RoutingDecisionReason.EXISTING_RESOURCE_LOCK, signals, true);
    }
    if (signals.selectedCountryCode === NormalizedCountry.RU) {
      return this.result(DataRegion.RU, RoutingConfidence.HIGH, RoutingDecisionReason.USER_SELECTED_RUSSIA, signals);
    }
    if (signals.serverCountryCode === NormalizedCountry.RU) {
      return this.result(DataRegion.RU, RoutingConfidence.HIGH, RoutingDecisionReason.SERVER_IP_RUSSIA, signals, false, true);
    }
    if (signals.phoneCountryClassification === PhoneCountryClassification.RUSSIA_OR_KAZAKHSTAN_PREFIX && signals.selectedCountryCode !== NormalizedCountry.KZ) {
      return this.result(DataRegion.RU, RoutingConfidence.MEDIUM, RoutingDecisionReason.PHONE_CODE_RUSSIA, signals);
    }

    const conflict = this.conflictDetector.detect(signals);
    if (conflict.conflict) return this.result(DataRegion.RU, RoutingConfidence.MEDIUM, RoutingDecisionReason.CONFLICT_SAFE_RU, signals, false, true);

    if (signals.localeClassification === LocaleClassification.RUSSIAN && !hasInternationalConfirmation(signals)) {
      return this.result(DataRegion.RU, RoutingConfidence.LOW, RoutingDecisionReason.RUSSIAN_LOCALE_DEFAULT, signals);
    }
    if (signals.selectedCountryCode === NormalizedCountry.US && signals.serverCountryCode !== NormalizedCountry.RU) {
      return this.result(DataRegion.INTERNATIONAL, RoutingConfidence.HIGH, RoutingDecisionReason.INTERNATIONAL_CONFIRMED, signals);
    }
    if (signals.selectedCountryCode === NormalizedCountry.OTHER && signals.serverCountryCode !== NormalizedCountry.RU) {
      return this.result(DataRegion.INTERNATIONAL, RoutingConfidence.MEDIUM, RoutingDecisionReason.INTERNATIONAL_CONFIRMED, signals);
    }
    if (signals.localeClassification === LocaleClassification.RUSSIAN) {
      return this.result(DataRegion.RU, RoutingConfidence.LOW, RoutingDecisionReason.RUSSIAN_LOCALE_DEFAULT, signals);
    }
    return this.result(DataRegion.INTERNATIONAL, RoutingConfidence.LOW, RoutingDecisionReason.GLOBAL_DEFAULT, signals);
  }

  evaluateSignals(input) {
    return {
      selectedCountryCode: this.countryNormalizer.normalize(input.selectedCountry),
      serverCountryCode: this.countryNormalizer.normalize(input.serverCountryCode),
      phoneCountryClassification: this.phoneClassifier.classify(input.phone),
      localeClassification: this.localeClassifier.classify(input.locale),
      existingResourceRegionPresent: Boolean(input.existingResourceRegion)
    };
  }

  result(region, confidence, reason, evaluatedSignals, immutable = false, conflict = false) {
    return {
      region,
      confidence,
      reason,
      evaluatedSignals,
      immutable,
      conflict,
      decidedAt: new Date().toISOString(),
      routingPolicyVersion: this.policyVersion
    };
  }
}

function hasInternationalConfirmation(signals) {
  return signals.selectedCountryCode === NormalizedCountry.US && signals.serverCountryCode === NormalizedCountry.US;
}

function emptySignals() {
  return {
    selectedCountryCode: NormalizedCountry.UNKNOWN,
    serverCountryCode: NormalizedCountry.UNKNOWN,
    phoneCountryClassification: PhoneCountryClassification.INVALID,
    localeClassification: LocaleClassification.UNKNOWN,
    existingResourceRegionPresent: false
  };
}
