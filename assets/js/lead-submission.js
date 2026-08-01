(function initLeadSubmission(global) {
  const allowedModes = new Set(['legacy', 'new_api', 'shadow']);
  const piiKeys = new Set(['name', 'contact', 'contactValue', 'message', 'publicToken', 'token', 'authorization', 'cookie']);

  function readConfig(env = {}) {
    const source = { ...(global.W1ZZYDEV_LEAD_CONFIG || {}), ...env };
    const mode = allowedModes.has(source.FRONTEND_LEAD_SUBMISSION_MODE) ? source.FRONTEND_LEAD_SUBMISSION_MODE : 'legacy';
    return {
      mode,
      leadApiBaseUrl: String(source.LEAD_API_BASE_URL || ''),
      syntheticHeaderEnabled: source.LEAD_API_SYNTHETIC_HEADER_ENABLED === true || source.LEAD_API_SYNTHETIC_HEADER_ENABLED === 'true',
      allowShadowMode: source.ALLOW_FRONTEND_SHADOW_MODE === true || source.ALLOW_FRONTEND_SHADOW_MODE === 'true',
      timeoutMs: Number(source.LEAD_API_TIMEOUT_MS || 10000),
      nodeEnv: String(source.NODE_ENV || '')
    };
  }

  function assertSafeConfig(config) {
    const hostname = global.location?.hostname || '';
    const production = config.nodeEnv === 'production' || hostname !== 'localhost' && hostname !== '127.0.0.1';
    if (production && config.leadApiBaseUrl && /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(config.leadApiBaseUrl)) {
      throw createSubmissionError('CONFIG_ERROR', 0);
    }
    if (production && config.syntheticHeaderEnabled) throw createSubmissionError('CONFIG_ERROR', 0);
    if (production && config.mode === 'shadow' && !config.allowShadowMode) throw createSubmissionError('CONFIG_ERROR', 0);
  }

  function createProvider({ legacySubmit, fetchImpl = global.fetch.bind(global), config = readConfig(), logger = safeLog } = {}) {
    if (typeof legacySubmit !== 'function') throw new Error('legacySubmit is required');
    assertSafeConfig(config);
    let submitting = false;

    async function submit(formPayload) {
      if (submitting) return { ok: false, state: 'submitting' };
      submitting = true;
      const started = Date.now();
      const requestId = createRequestId();
      try {
        logger('lead_submit_started', safeLogPayload({ submissionMode: config.mode, requestId, countryCode: formPayload.country }));
        if (config.mode === 'new_api') {
          const result = await submitNewApi(formPayload, { fetchImpl, config, requestId });
          logger('lead_submit_success', safeLogPayload({ submissionMode: config.mode, requestId, result: 'new_api_success', durationBucket: durationBucket(Date.now() - started), countryCode: formPayload.country }));
          return { ok: true, provider: 'new_api', data: result };
        }
        const legacyResult = await legacySubmit(formPayload.legacyPayload || formPayload);
        if (config.mode === 'shadow') {
          submitShadow(formPayload, legacyResult, { fetchImpl, config, requestId, logger }).catch(error => {
            logger('lead_shadow_failed', safeLogPayload({ submissionMode: 'shadow', requestId, result: error.code || 'SHADOW_FAILED', countryCode: formPayload.country }));
          });
        }
        logger('lead_submit_success', safeLogPayload({ submissionMode: 'legacy', requestId, result: 'legacy_success', durationBucket: durationBucket(Date.now() - started), countryCode: formPayload.country }));
        return { ok: true, provider: 'legacy', data: legacyResult };
      } catch (error) {
        const mapped = mapLeadSubmissionError(error);
        logger('lead_submit_failed', safeLogPayload({ submissionMode: config.mode, requestId, result: mapped.code, statusCode: error.status || 0, durationBucket: durationBucket(Date.now() - started), countryCode: formPayload.country }));
        throw mapped;
      } finally {
        submitting = false;
      }
    }

    return { submit, getMode: () => config.mode };
  }

  async function submitNewApi(formPayload, { fetchImpl, config, requestId, synthetic = false } = {}) {
    if (!config.leadApiBaseUrl) throw createSubmissionError('CONFIG_ERROR', 0);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
    const headers = { 'content-type': 'application/json', 'x-w1zzydev-request-id': requestId };
    if ((synthetic || config.syntheticHeaderEnabled) && config.syntheticHeaderEnabled) headers['x-w1zzydev-synthetic-test'] = 'true';
    try {
      const response = await fetchImpl(`${config.leadApiBaseUrl.replace(/\/$/, '')}/api/v1/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify(toLeadApiPayload(formPayload)),
        signal: controller.signal
      });
      const json = await parseJson(response);
      if (!response.ok || json?.ok === false) throw createSubmissionError(json?.error?.code || 'API_ERROR', response.status);
      return { ok: true };
    } catch (error) {
      if (error.name === 'AbortError') throw createSubmissionError('TIMEOUT', 0);
      throw error.code ? error : createSubmissionError('NETWORK_ERROR', 0);
    } finally {
      clearTimeout(timeout);
    }
  }

  async function submitShadow(formPayload, legacyResult, deps) {
    const shadowPayload = createShadowPayload(formPayload, legacyResult);
    await submitNewApi(shadowPayload, { ...deps, synthetic: true });
    deps.logger('lead_shadow_success', safeLogPayload({ submissionMode: 'shadow', requestId: deps.requestId, result: 'shadow_success', countryCode: shadowPayload.country }));
  }

  function toLeadApiPayload(payload) {
    return {
      selectedCountry: payload.country || '',
      name: payload.name,
      contactType: normalizeContactType(payload.contactType),
      contactValue: payload.contactValue,
      message: payload.message,
      consentId: payload.consentId || 'frontend-consent-current',
      attachmentsCount: 0,
      source: payload.source || 'website',
      language: payload.language || 'ru',
      metadata: allowMetadata(payload.metadata),
      clientRequestId: payload.clientRequestId || createRequestId()
    };
  }

  function createShadowPayload(payload, legacyResult = {}) {
    return {
      country: payload.country || '',
      name: 'Shadow Test User',
      contactType: 'email',
      contactValue: 'shadow-test@example.invalid',
      message: 'Synthetic shadow submission',
      consentId: 'synthetic-shadow-consent',
      source: 'frontend-shadow',
      language: payload.language || 'en',
      clientRequestId: createRequestId(),
      metadata: allowMetadata({
        formId: payload.metadata?.formId || '',
        page: payload.metadata?.page || global.location?.pathname || '/',
        legacyResult: legacyResult?.submissionKey ? 'created' : 'ok',
        originalCountryCode: payload.country || ''
      })
    };
  }

  function allowMetadata(metadata = {}) {
    const allowed = new Set(['formId', 'page', 'legacyResult', 'originalCountryCode', 'campaign', 'utmSource', 'utmMedium', 'utmCampaign', 'referrerCategory']);
    return Object.fromEntries(Object.entries(metadata || {}).filter(([key, value]) => allowed.has(key) && ['string', 'number', 'boolean'].includes(typeof value)).map(([key, value]) => [key, key === 'page' ? String(value).split('?')[0] : value]));
  }

  function normalizeContactType(value) {
    const map = { email: 'EMAIL', site_chat: 'EMAIL', phone: 'PHONE', telegram: 'TELEGRAM', whatsapp: 'WHATSAPP', instagram: 'INSTAGRAM' };
    return map[String(value || '').toLowerCase()] || 'OTHER';
  }

  async function parseJson(response) {
    try {
      return await response.json();
    } catch {
      throw createSubmissionError('MALFORMED_RESPONSE', response.status || 0);
    }
  }

  function mapLeadSubmissionError(error) {
    const code = error.code || 'NETWORK_ERROR';
    const temporary = ['TIMEOUT', 'NETWORK_ERROR', 'API_ERROR', 'REPOSITORY_UNAVAILABLE'].includes(code) || [429, 500, 503].includes(error.status);
    return { code, state: temporary ? 'temporary_error' : 'validation_error', messageRu: temporary ? 'Не удалось отправить заявку. Попробуйте ещё раз.' : 'Проверьте поля формы.', messageEn: temporary ? 'Could not submit the request. Please try again.' : 'Please check the form fields.', status: error.status || 0 };
  }

  function createSubmissionError(code, status) {
    const error = new Error(code);
    error.code = code;
    error.status = status;
    return error;
  }

  function createRequestId() {
    return global.crypto?.randomUUID ? global.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function durationBucket(ms) {
    if (ms < 250) return 'lt_250ms';
    if (ms < 1000) return 'lt_1s';
    if (ms < 3000) return 'lt_3s';
    return 'gte_3s';
  }

  function safeLog(event, details) {
    if (global.W1ZZYDEV_LEAD_LOGS === true) console.info(event, safeLogPayload(details));
  }

  function safeLogPayload(details = {}) {
    return Object.fromEntries(Object.entries(details).filter(([key]) => !piiKeys.has(key)));
  }

  global.W1ZZYDEVLeadSubmission = { createProvider, readConfig, toLeadApiPayload, createShadowPayload, mapLeadSubmissionError, safeLogPayload };
})(window);
