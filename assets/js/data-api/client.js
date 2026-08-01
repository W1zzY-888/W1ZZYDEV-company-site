(() => {
  const defaults = Object.freeze({
    DUAL_REGION_ENABLED: false,
    RU_DATA_ROUTE_ENABLED: false,
    DIRECT_SUPABASE_LEGACY_MODE: true,
    STRICT_RU_ROUTING: false
  });
  window.W1ZZYDEV_DATA_API_FLAGS = Object.freeze({ ...defaults, ...(window.W1ZZYDEV_DATA_API_FLAGS || {}) });

  function legacyAdapter() {
    return {
      region: 'LEGACY_SUPABASE',
      mode: 'direct_supabase_legacy',
      async request() {
        throw new Error('Legacy Supabase compatibility mode is still handled by existing app.js flows.');
      }
    };
  }

  function createClient(signals = {}) {
    const route = window.W1ZZYDEV_DATA_ROUTER?.resolveClientRoute?.(signals) || { region: 'LEGACY_SUPABASE', reason: 'router_not_loaded' };
    if (route.region === 'RU' && window.W1ZZYDEV_RU_DATA_ADAPTER) return new window.W1ZZYDEV_RU_DATA_ADAPTER();
    if (route.region === 'INTERNATIONAL' && window.W1ZZYDEV_INTERNATIONAL_DATA_ADAPTER) return new window.W1ZZYDEV_INTERNATIONAL_DATA_ADAPTER();
    return legacyAdapter();
  }

  window.W1ZZYDEV_DATA_API = Object.freeze({
    flags: window.W1ZZYDEV_DATA_API_FLAGS,
    endpoints: window.W1ZZYDEV_DATA_TYPES?.Endpoints || {},
    createClient,
    resolveRoute: signals => window.W1ZZYDEV_DATA_ROUTER?.resolveClientRoute?.(signals)
  });
})();
