(() => {
  const Region = Object.freeze({
    RU: 'RU',
    INTERNATIONAL: 'INTERNATIONAL',
    LEGACY_SUPABASE: 'LEGACY_SUPABASE'
  });

  const Endpoints = Object.freeze({
    leads: '/api/v1/leads',
    chatConversations: '/api/v1/chat/conversations',
    chatMessages: '/api/v1/chat/messages',
    chatAttachments: '/api/v1/chat/attachments',
    supportTickets: '/api/v1/support/tickets',
    reviews: '/api/v1/reviews',
    authRegister: '/api/v1/auth/register',
    authLogin: '/api/v1/auth/login',
    authPasswordReset: '/api/v1/auth/password-reset',
    privacyRequests: '/api/v1/privacy/requests',
    consents: '/api/v1/consents',
    chatConversationByToken: token => `/api/v1/chat/conversations/${encodeURIComponent(token)}`,
    chatMessagesByToken: token => `/api/v1/chat/messages/${encodeURIComponent(token)}`
  });

  window.W1ZZYDEV_DATA_TYPES = Object.freeze({ Region, Endpoints });
})();
