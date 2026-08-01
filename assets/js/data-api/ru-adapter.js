(() => {
  const endpoints = window.W1ZZYDEV_DATA_TYPES?.Endpoints || {};

  class RuDataAdapter {
    constructor({ fetchImpl = window.fetch.bind(window) } = {}) {
      this.fetchImpl = fetchImpl;
      this.region = 'RU';
    }

    async request(endpoint, payload, options = {}) {
      const response = await this.fetchImpl(endpoint, {
        method: options.method || 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        body: options.method === 'GET' ? undefined : JSON.stringify(payload || {})
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || data?.error || 'RU data API request failed');
      return data;
    }

    createLead(payload) { return this.request(endpoints.leads, payload); }
    createConversation(payload) { return this.request(endpoints.chatConversations, payload); }
    createMessage(payload) { return this.request(endpoints.chatMessages, payload); }
    createAttachment(payload) { return this.request(endpoints.chatAttachments, payload); }
    createSupportTicket(payload) { return this.request(endpoints.supportTickets, payload); }
    createReview(payload) { return this.request(endpoints.reviews, payload); }
    register(payload) { return this.request(endpoints.authRegister, payload); }
    login(payload) { return this.request(endpoints.authLogin, payload); }
    requestPasswordReset(payload) { return this.request(endpoints.authPasswordReset, payload); }
    createPrivacyRequest(payload) { return this.request(endpoints.privacyRequests, payload); }
    recordConsent(payload) { return this.request(endpoints.consents, payload); }
  }

  window.W1ZZYDEV_RU_DATA_ADAPTER = RuDataAdapter;
})();
