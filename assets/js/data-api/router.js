(() => {
  const types = window.W1ZZYDEV_DATA_TYPES || {};
  const validation = window.W1ZZYDEV_DATA_VALIDATION || {};
  const Region = types.Region || { RU: 'RU', INTERNATIONAL: 'INTERNATIONAL', LEGACY_SUPABASE: 'LEGACY_SUPABASE' };

  const flags = Object.freeze({
    DUAL_REGION_ENABLED: false,
    RU_DATA_ROUTE_ENABLED: false,
    DIRECT_SUPABASE_LEGACY_MODE: true,
    STRICT_RU_ROUTING: false,
    ...(window.W1ZZYDEV_DATA_API_FLAGS || {})
  });

  function resolveClientRoute(signals = {}) {
    const country = validation.normalizeCountry ? validation.normalizeCountry(signals.country) : String(signals.country || '').toUpperCase();
    if (!flags.DUAL_REGION_ENABLED || !flags.RU_DATA_ROUTE_ENABLED) {
      return { region: Region.LEGACY_SUPABASE, reason: 'legacy_flags_disabled', locked: false };
    }
    if (signals.existingRegion) return { region: signals.existingRegion, reason: 'existing_region_immutable', locked: true };
    if (country === 'RU') return { region: Region.RU, reason: 'explicit_country_ru', locked: false };
    if (signals.serverIpCountry === 'RU') return { region: Region.RU, reason: 'server_ip_ru', locked: false };
    if (validation.phoneLooksRussian?.(signals.phone, country)) return { region: Region.RU, reason: 'phone_plus_7', locked: false };
    if (signals.conflict) return { region: Region.RU, reason: 'conflicting_signals', locked: false };
    if (!country && signals.locale === 'ru') return { region: Region.RU, reason: 'insufficient_signals_ru_locale', locked: false };
    return { region: Region.INTERNATIONAL, reason: 'international_signals', locked: false };
  }

  window.W1ZZYDEV_DATA_ROUTER = Object.freeze({ flags, resolveClientRoute });
})();
