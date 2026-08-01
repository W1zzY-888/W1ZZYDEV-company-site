import { LocaleClassification, NormalizedCountry, PhoneCountryClassification } from '../constants/routing-constants.js';

export class RoutingConflictDetector {
  detect(signals) {
    const conflicts = [];
    const selected = signals.selectedCountryCode;
    const server = signals.serverCountryCode;
    const phone = signals.phoneCountryClassification;

    if (selected === NormalizedCountry.US && server === NormalizedCountry.RU) conflicts.push('selected_us_server_ru');
    if (selected === NormalizedCountry.RU && [NormalizedCountry.US, NormalizedCountry.OTHER, NormalizedCountry.KZ].includes(server)) conflicts.push('selected_ru_server_non_ru');
    if (selected === NormalizedCountry.OTHER && phone === PhoneCountryClassification.RUSSIA_OR_KAZAKHSTAN_PREFIX) conflicts.push('selected_other_phone_plus_7');
    if (selected === NormalizedCountry.US && phone === PhoneCountryClassification.RUSSIA_OR_KAZAKHSTAN_PREFIX) conflicts.push('selected_us_phone_plus_7');
    if (server === NormalizedCountry.RU && selected && selected !== NormalizedCountry.RU && selected !== NormalizedCountry.UNKNOWN) conflicts.push('server_ru_selected_non_ru');
    if (signals.localeClassification === LocaleClassification.RUSSIAN && selected === NormalizedCountry.US && server === NormalizedCountry.US) return { conflict: false, conflicts: [] };

    return { conflict: conflicts.length > 0, conflicts };
  }
}
