import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('../..', import.meta.url).pathname);
const app = await readFile(resolve(root, 'app.js'), 'utf8');
const draftSql = await readFile(resolve(root, 'supabase/migrations/20260731_001_chat_locale_attachments_draft.sql'), 'utf8');
const chatClientCode = app.slice(app.indexOf('const universalChatStorageKey'), app.indexOf('async function closeGuestConversation'));

assert.ok(app.includes('locale: lang === \'en\' ? \'en\' : \'ru\''), 'chat state keeps a session locale');
assert.ok(app.includes('function normalizeChatLocale'), 'locale normalizer exists');
assert.ok(app.includes('function currentChatLocale'), 'active chat locale accessor exists');
assert.ok(app.includes('function syncEmptyChatLocaleWithInterface'), 'empty session may sync locale on explicit language switch');
assert.ok(app.includes('syncEmptyChatLocaleWithInterface()'), 'setLang syncs only eligible empty chat sessions');
assert.ok(app.includes('locale: normalizeChatLocale(session.locale || universalChatState.locale || lang)'), 'chat session persists locale');
assert.ok(app.includes('universalChatState.locale = normalizeChatLocale(session.locale || lang)'), 'restore uses saved session locale');
assert.ok(chatClientCode.includes('locale: currentChatLocale()'), 'assistant edge request uses session locale');
assert.ok(!chatClientCode.includes('locale: lang\n'), 'assistant request no longer uses raw UI lang');

assert.ok(app.includes('Здравствуйте! Я помощник W1ZZYDEV. Ваше сообщение уже передано специалисту. Пока он подключается, я могу ответить на частые вопросы.'), 'required RU greeting exists');
assert.ok(app.includes('Hello! I’m the W1ZZYDEV assistant. Your message has already been forwarded to a specialist. While they are joining the conversation, I can help with common questions.'), 'required EN greeting exists');
assert.ok(app.includes('Стоимость разработки'), 'required RU quick reply exists');
assert.ok(app.includes('Development cost'), 'required EN quick reply exists');
assert.ok(app.includes('Project timeline'), 'required EN timeline quick reply exists');
assert.ok(app.includes('How the process works'), 'required EN process quick reply exists');
assert.ok(app.includes('Website support'), 'required EN support quick reply exists');
assert.ok(app.includes('Contact a specialist'), 'required EN specialist quick reply exists');

assert.ok(!/country|request_ip|userAgent|navigator\.language/.test(app.slice(app.indexOf('const chatTexts'), app.indexOf('const chatNotificationState'))), 'chat locale dictionary does not use country, IP, or browser locale');
assert.ok(draftSql.includes('add column if not exists locale'), 'draft SQL documents DB locale requirement');
assert.ok(draftSql.includes('DRAFT ONLY. Do not apply to production'), 'draft SQL is explicitly not production-ready');

console.log('chat-locale-static: ok');
