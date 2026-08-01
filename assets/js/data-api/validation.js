(() => {
  function normalizeCountry(value) {
    const country = String(value || '').trim().toUpperCase();
    if (['RU', 'RUS', 'RUSSIA', 'РОССИЯ'].includes(country)) return 'RU';
    if (['US', 'USA', 'UNITED STATES', 'США'].includes(country)) return 'US';
    if (country) return 'OTHER';
    return '';
  }

  function phoneLooksRussian(value, explicitCountry = '') {
    const country = normalizeCountry(explicitCountry);
    const phone = String(value || '').replace(/[^\d+]/g, '');
    if (!phone.startsWith('+7') && !phone.startsWith('7')) return false;
    return country !== 'KZ';
  }

  function hasRequiredFields(payload, fields) {
    const missing = fields.filter(field => !String(payload?.[field] || '').trim());
    return { ok: missing.length === 0, missing };
  }

  window.W1ZZYDEV_DATA_VALIDATION = Object.freeze({
    normalizeCountry,
    phoneLooksRussian,
    hasRequiredFields
  });
})();
