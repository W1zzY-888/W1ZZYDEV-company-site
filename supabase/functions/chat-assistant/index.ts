import { createClient } from '@supabase/supabase-js';
import { W1ZZYDEV_ASSISTANT_INSTRUCTIONS } from './assistant-prompt.ts';

type SupabaseAdmin = ReturnType<typeof createClient<any, 'public', any>>;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const DEFAULT_MODEL = 'gpt-4.1-mini';
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_KNOWLEDGE_ITEMS = 8;
const OPENAI_TIMEOUT_MS = 18000;
const TELEGRAM_TIMEOUT_MS = 8000;
const OPENAI_ASSISTANT_ENABLED = Deno.env.get('ENABLE_OPENAI_ASSISTANT') === 'true';
const TELEGRAM_NOTIFICATION_PRIVACY_MODE = Deno.env.get('TELEGRAM_NOTIFICATION_PRIVACY_MODE') || 'minimal';

type ChatPayload = {
  action?: string;
  conversation_id?: string;
  guest_token?: string;
  message_id?: string;
  client_message_id?: string;
  locale?: string;
};

type MessageContext = {
  message_id: string;
  conversation_id: string;
  source_client_message_id: string | null;
  sender: string;
  body: string;
  created_at: string;
  conversation_status: string;
  archived_at: string | null;
  deleted_at: string | null;
  assistant_mode: string | null;
  needs_human: boolean;
  owner_joined_at: string | null;
  category: string | null;
  subject: string | null;
  page_url: string | null;
  client_name: string | null;
  client_contact: string | null;
  reminder_channel?: string | null;
  reminder_minutes?: number | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function normalizeText(value: unknown, max = MAX_MESSAGE_CHARS) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function sanitizeError(value: unknown, max = 300) {
  return normalizeText(value, max).replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || '');
}

function safeLog(operation: string, details: Record<string, unknown>) {
  console.error('[W1ZZYDEV CHAT EDGE]', {
    operation,
    conversationId: details.conversationId || '',
    messageId: details.messageId || '',
    status: details.status || '',
    code: details.code || '',
    error: details.error ? sanitizeError(details.error, 220) : ''
  });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function needsHuman(message: string) {
  return /(договор|оплат|сч[её]т|возврат|юрист|жалоб|срочно|максим|owner|secret|token|парол|личн|конфиденц|цена точно|точная стоимость|гарантируй|скидк|refund|invoice|contract|urgent|password|confidential|exact price|guarantee|discount)/i.test(message);
}

function looksLikePromptInjection(message: string) {
  return /(system prompt|developer message|ignore previous|раскрой инструкц|системн(ый|ые) prompt|покажи инструкц|секрет|service role|api key|токен|пароль)/i.test(message);
}

function selectKnowledge(knowledge: Array<{ title: string; content: string; category: string }>, message: string) {
  const lower = message.toLowerCase();
  const words = lower.split(/\s+/).filter(word => word.length > 3).slice(0, 24);
  const scored = knowledge.map(item => {
    const haystack = `${item.title} ${item.category} ${item.content}`.toLowerCase();
    const score = words.filter(word => haystack.includes(word)).length;
    return { item, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .filter(entry => entry.score > 0)
    .slice(0, MAX_KNOWLEDGE_ITEMS)
    .map(entry => entry.item)
    .concat(scored.filter(entry => entry.score === 0).slice(0, 3).map(entry => entry.item))
    .slice(0, MAX_KNOWLEDGE_ITEMS);
}

function extractResponseText(responseJson: Record<string, unknown>) {
  if (typeof responseJson.output_text === 'string') return normalizeText(responseJson.output_text, 1600);
  const output = Array.isArray(responseJson.output) ? responseJson.output : [];
  const parts: string[] = [];
  for (const item of output as Array<Record<string, unknown>>) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const block of content as Array<Record<string, unknown>>) {
      if (typeof block.text === 'string') parts.push(block.text);
      if (typeof block.content === 'string') parts.push(block.content);
    }
  }
  return normalizeText(parts.join('\n'), 1600);
}

function telegramEscape(value: unknown) {
  const replacements: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  return String(value || '').replace(/[&<>]/g, char => replacements[char] || char);
}

function shorten(value: unknown, max = 700) {
  const text = normalizeText(value, max + 1);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

async function isAuthorized(admin: SupabaseAdmin, request: Request, payload: ChatPayload, conversationId: string) {
  const authHeader = request.headers.get('authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (jwt && jwt !== request.headers.get('apikey')) {
    const { data: userData } = await admin.auth.getUser(jwt);
    if (userData.user?.id) {
      const { data: ownerProfile } = await admin
        .from('admin_profiles')
        .select('user_id, role')
        .eq('user_id', userData.user.id)
        .eq('role', 'owner')
        .maybeSingle();
      if (ownerProfile) return true;
    }
  }

  if (!payload.guest_token) return false;
  const tokenHash = await sha256(payload.guest_token);
  const { data: guestSession } = await admin
    .from('guest_sessions')
    .select('conversation_id, expires_at, revoked_at')
    .or(`token_hash.eq.${tokenHash},guest_token_hash.eq.${tokenHash}`)
    .eq('conversation_id', conversationId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  return Boolean(guestSession && !guestSession.revoked_at);
}

function canProcessClientMessage(context: MessageContext | null) {
  return Boolean(
    context
    && context.sender === 'client'
    && context.conversation_status !== 'closed'
    && !context.archived_at
    && !context.deleted_at
  );
}

async function getMessageContext(admin: SupabaseAdmin, conversationId: string, messageId: string, clientMessageId: string) {
  const { data, error } = await admin.rpc('chat_edge_message_context', {
    p_conversation_id: conversationId,
    p_source_message_id: messageId || null,
    p_source_client_message_id: clientMessageId || null
  });
  if (error) throw error;
  const context = Array.isArray(data) ? data[0] : data;
  return context as MessageContext | null;
}

function notificationTitle(context: MessageContext, channel: string) {
  if (channel === 'telegram_reminder_10' || channel === 'telegram_reminder_30') {
    const minutes = context.reminder_minutes || (channel === 'telegram_reminder_30' ? 30 : 10);
    return `⏰ Клиент ждёт ответ ${minutes} минут`;
  }
  return '🔔 Новое сообщение клиента W1ZZYDEV';
}

async function sendTelegram(admin: SupabaseAdmin, context: MessageContext, channel = 'telegram_owner') {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  const adminUrl = Deno.env.get('SITE_ADMIN_URL') || 'https://w1zzydev.com/reviews/moderation/';

  const { data: reservation, error: reserveError } = await admin.rpc('chat_edge_reserve_notification', {
    p_message_id: context.message_id,
    p_channel: channel
  });
  if (reserveError) throw reserveError;
  const reserved = Array.isArray(reservation) ? reservation[0] : reservation;
  if (!reserved?.should_send) return { skipped: true, status: reserved?.status || 'skipped' };

  if (!token || !chatId) {
    await admin.rpc('chat_edge_finish_notification', {
      p_notification_id: reserved.notification_id,
      p_status: 'skipped',
      p_error: 'telegram_not_configured'
    });
    return { skipped: true, status: 'telegram_not_configured' };
  }

  const conversationUrl = new URL(adminUrl);
  conversationUrl.searchParams.set('conversation', context.conversation_id);
  const minimalMode = TELEGRAM_NOTIFICATION_PRIVACY_MODE !== 'full';
  const html = minimalMode ? [
    `<b>${telegramEscape(notificationTitle(context, channel))}</b>`,
    '',
    `<b>ID обращения:</b> ${telegramEscape(context.conversation_id)}`,
    `<b>Категория:</b> ${telegramEscape(context.category || 'Диалог')}`,
    `<b>Время:</b> ${telegramEscape(new Date().toISOString())}`,
    'Новое сообщение доступно в защищённой админке.'
  ].join('\n') : [
    `<b>${telegramEscape(notificationTitle(context, channel))}</b>`,
    '',
    `<b>Тема:</b> ${telegramEscape(context.subject || context.category || 'Диалог')}`,
    `<b>Клиент:</b> ${telegramEscape(context.client_name || 'не указан')}`,
    `<b>Сообщение:</b> ${telegramEscape(shorten(context.body, 700))}`
  ].join('\n');

  const response = await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: html,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: 'Открыть диалог', url: conversationUrl.toString() }]]
      }
    })
  }, TELEGRAM_TIMEOUT_MS);

  if (!response.ok) {
    await admin.rpc('chat_edge_finish_notification', {
      p_notification_id: reserved.notification_id,
      p_status: 'failed',
      p_error: `telegram_http_${response.status}`
    });
    return { skipped: false, status: 'failed', httpStatus: response.status };
  }

  await admin.rpc('chat_edge_finish_notification', {
    p_notification_id: reserved.notification_id,
    p_status: 'sent',
    p_error: null
  });
  return { skipped: false, status: 'sent' };
}

async function sendDueReminders(admin: SupabaseAdmin) {
  const { data, error } = await admin.rpc('chat_edge_due_reminders');
  if (error) throw error;
  const reminders = (Array.isArray(data) ? data : []) as MessageContext[];
  const results = [];
  for (const reminder of reminders) {
    try {
      results.push(await sendTelegram(admin, reminder, reminder.reminder_channel || 'telegram_reminder_10'));
    } catch (error) {
      safeLog('telegram.reminder', {
        conversationId: reminder.conversation_id,
        messageId: reminder.message_id,
        error: errorMessage(error)
      });
      results.push({ status: 'failed' });
    }
  }
  return { processed: reminders.length, results };
}

async function runAi(admin: SupabaseAdmin, context: MessageContext, locale: string) {
  if (context.sender !== 'client') return { skipped: true, reason: 'not_client_message' };
  if (context.conversation_status === 'closed' || context.archived_at || context.deleted_at) return { skipped: true, reason: 'conversation_locked' };
  if (context.needs_human) return { skipped: true, reason: 'needs_human' };
  if ((context.assistant_mode || 'auto') !== 'auto') return { skipped: true, reason: 'assistant_not_auto' };
  if (context.owner_joined_at) return { skipped: true, reason: 'owner_joined' };

  const requestHash = await sha256(`${context.conversation_id}:${context.message_id}:${context.source_client_message_id || ''}`);
  const { data: reservation, error: reserveError } = await admin.rpc('chat_edge_reserve_ai_run', {
    p_conversation_id: context.conversation_id,
    p_source_message_id: context.message_id,
    p_source_client_message_id: context.source_client_message_id || null,
    p_request_hash: requestHash
  });
  if (reserveError) throw reserveError;
  const reserved = Array.isArray(reservation) ? reservation[0] : reservation;
  if (!reserved?.should_process) return { skipped: true, reason: reserved?.status || 'already_processed' };

  const runId = reserved.run_id;
  const handoffMessage = 'Передаю вопрос специалисту W1ZZYDEV. Он продолжит общение в этом диалоге.';
  const humanRequired = needsHuman(context.body) || looksLikePromptInjection(context.body);
  if (humanRequired) {
    const { data: saved, error } = await admin.rpc('chat_edge_save_assistant_response', {
      p_conversation_id: context.conversation_id,
      p_source_client_message_id: context.source_client_message_id || null,
      p_body: handoffMessage,
      p_needs_human: true,
      p_error: null,
      p_source_message_id: context.message_id,
      p_run_id: runId
    });
    if (error) throw error;
    return { message: Array.isArray(saved) ? saved[0] : saved, needs_human: true };
  }

  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiKey) {
    await admin.rpc('chat_edge_finish_ai_run', {
      p_run_id: runId,
      p_status: 'skipped',
      p_error: null,
      p_skipped_reason: 'openai_not_configured'
    });
    return { skipped: true, reason: 'openai_not_configured' };
  }

  const model = Deno.env.get('OPENAI_MODEL') || DEFAULT_MODEL;
  const [{ data: settings }, { data: knowledge }, { data: recentMessages }] = await Promise.all([
    admin.from('assistant_settings').select('*').eq('id', true).maybeSingle(),
    admin.from('assistant_knowledge').select('title,content,category').eq('enabled', true).limit(40),
    admin.rpc('chat_edge_recent_context', { p_conversation_id: context.conversation_id, p_limit: MAX_HISTORY_MESSAGES })
  ]);
  if (settings?.enabled === false) {
    await admin.rpc('chat_edge_finish_ai_run', {
      p_run_id: runId,
      p_status: 'skipped',
      p_error: null,
      p_skipped_reason: 'assistant_disabled_in_settings'
    });
    return { skipped: true, reason: 'assistant_disabled_in_settings' };
  }

  const { count: recentRuns } = await admin
    .from('assistant_runs')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', context.conversation_id)
    .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());
  if ((recentRuns || 0) > 10) {
    await admin.rpc('chat_edge_finish_ai_run', {
      p_run_id: runId,
      p_status: 'skipped',
      p_error: null,
      p_skipped_reason: 'ai_rate_limited'
    });
    return { skipped: true, reason: 'ai_rate_limited' };
  }

  const selectedKnowledge = selectKnowledge(knowledge || [], context.body);
  const history = [...(recentMessages || [])]
    .reverse()
    .map((item: { sender: string; body: string }) => `${item.sender}: ${normalizeText(item.body, 700)}`)
    .join('\n');
  const knowledgeText = selectedKnowledge
    .map(item => `- ${item.category}: ${item.title}. ${normalizeText(item.content, 700)}`)
    .join('\n');
  const maxAnswerChars = Math.min(1400, Math.max(300, Number(settings?.max_answer_chars || 900)));

  const prompt = [
    `Язык ответа: ${locale || settings?.locale || 'ru'}.`,
    `Тон: ${settings?.tone || 'professional'}.`,
    `Максимальная длина ответа: ${maxAnswerChars} символов.`,
    '',
    'База знаний W1ZZYDEV:',
    knowledgeText || '- Нет дополнительных записей базы знаний.',
    '',
    'История текущего диалога:',
    history || '- История пуста.',
    '',
    `Новое сообщение клиента: ${normalizeText(context.body, MAX_MESSAGE_CHARS)}`
  ].join('\n');

  const aiResponse = await fetchWithTimeout('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      instructions: W1ZZYDEV_ASSISTANT_INSTRUCTIONS,
      input: prompt,
      temperature: 0.35,
      max_output_tokens: 450
    })
  }, OPENAI_TIMEOUT_MS);

  const aiJson = await aiResponse.json().catch(() => ({}));
  if (!aiResponse.ok) {
    await admin.rpc('chat_edge_finish_ai_run', {
      p_run_id: runId,
      p_status: 'failed',
      p_error: `openai_http_${aiResponse.status}`,
      p_skipped_reason: null
    });
    return { skipped: false, status: 'openai_failed', httpStatus: aiResponse.status };
  }

  const answer = normalizeText(extractResponseText(aiJson), maxAnswerChars);
  if (!answer) {
    await admin.rpc('chat_edge_finish_ai_run', {
      p_run_id: runId,
      p_status: 'failed',
      p_error: 'openai_empty_response',
      p_skipped_reason: null
    });
    return { skipped: false, status: 'openai_empty_response' };
  }

  const { data: saved, error } = await admin.rpc('chat_edge_save_assistant_response', {
    p_conversation_id: context.conversation_id,
    p_source_client_message_id: context.source_client_message_id || null,
    p_body: answer,
    p_needs_human: false,
    p_error: null,
    p_source_message_id: context.message_id,
    p_run_id: runId
  });
  if (error) throw error;
  return { message: Array.isArray(saved) ? saved[0] : saved, status: 'completed' };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const requestId = crypto.randomUUID();
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server environment is not configured' }, 500);

  const payload = await request.json().catch(() => ({} as ChatPayload)) as ChatPayload;
  const action = normalizeText(payload.action, 40) || 'message';
  const conversationId = normalizeText(payload.conversation_id, 80);
  const messageId = normalizeText(payload.message_id, 80);
  const clientMessageId = normalizeText(payload.client_message_id, 160);
  const locale = normalizeText(payload.locale, 8) || 'ru';

  const admin: SupabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    if (action === 'send_reminders') {
      const authHeader = request.headers.get('authorization') || '';
      if (authHeader !== `Bearer ${serviceRoleKey}`) return json({ error: 'Not authorized' }, 403);
      return json({ request_id: requestId, reminders: await sendDueReminders(admin) });
    }

    if (!conversationId || (!messageId && !clientMessageId)) {
      return json({ error: 'conversation_id and message identifier are required' }, 400);
    }

    const context = await getMessageContext(admin, conversationId, messageId, clientMessageId);
    if (!context) return json({ skipped: true, reason: 'client_message_not_found' });
    if (context.sender !== 'client') return json({ skipped: true, reason: 'not_client_message' });
    if (!canProcessClientMessage(context)) return json({ skipped: true, reason: 'conversation_locked' });

    const authorized = await isAuthorized(admin, request, payload, conversationId);
    if (!authorized) {
      safeLog('auth.client_message_fallback', {
        conversationId,
        messageId: context.message_id,
        status: 'accepted'
      });
    }

    const [telegramResult, aiResult] = await Promise.allSettled([
      sendTelegram(admin, context),
      OPENAI_ASSISTANT_ENABLED
        ? runAi(admin, context, locale)
        : Promise.resolve({ skipped: true, reason: 'openai_assistant_disabled' })
    ]);

    if (telegramResult.status === 'rejected') {
      safeLog('telegram.notify', {
        conversationId,
        messageId: context.message_id,
        error: errorMessage(telegramResult.reason)
      });
    }
    if (aiResult.status === 'rejected') {
      safeLog('ai.respond', {
        conversationId,
        messageId: context.message_id,
        error: errorMessage(aiResult.reason)
      });
    }

    return json({
      request_id: requestId,
      telegram: telegramResult.status === 'fulfilled' ? telegramResult.value : { status: 'failed' },
      ai: aiResult.status === 'fulfilled' ? aiResult.value : { status: 'failed' }
    });
  } catch (error) {
    safeLog('request', { conversationId, messageId, error: errorMessage(error) });
    return json({ error: 'Processing failed', request_id: requestId }, 500);
  }
});
