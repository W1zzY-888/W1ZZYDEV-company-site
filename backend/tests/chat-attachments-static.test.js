import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('../..', import.meta.url).pathname);
const app = await readFile(resolve(root, 'app.js'), 'utf8');
const draftSql = await readFile(resolve(root, 'supabase/migrations/20260731_001_chat_locale_attachments_draft.sql'), 'utf8');
const chatClientCode = app.slice(app.indexOf('function renderUniversalChatMessages'), app.indexOf('function assistantActionQuestion'));

assert.ok(app.includes("const chatAttachmentBucket = 'chat-attachments'"), 'chat bucket is chat-attachments');
assert.ok(app.includes('const chatAttachmentMaxBytes = 10 * 1024 * 1024'), 'attachment limit is 10 MB');
assert.ok(app.includes('image/jpeg') && app.includes('image/png') && app.includes('image/webp'), 'image MIME allow-list exists');
assert.ok(app.includes('application/pdf') && app.includes('wordprocessingml.document') && app.includes('spreadsheetml.sheet'), 'document MIME allow-list exists');
assert.ok(!app.includes("'image/gif',"), 'GIF is not accepted by frontend allow-list');
assert.ok(app.includes("chatAttachmentDangerousExtensions = new Set(['html', 'htm', 'svg', 'js', 'mjs', 'exe', 'dmg', 'pkg', 'zip'])"), 'dangerous extensions are blocked');
assert.ok(app.includes('file.type !== expectedMime'), 'MIME and extension must match');
assert.ok(app.includes('throw chatAttachmentUserError(\'attachmentUnsupported\')'), 'unsupported format uses localized safe message');
assert.ok(app.includes('throw chatAttachmentUserError(\'attachmentTooLarge\')'), 'oversized payload uses localized safe message');

assert.ok(app.includes('Не удалось загрузить файл. Попробуйте ещё раз.'), 'RU upload failure text exists');
assert.ok(app.includes('The file could not be uploaded. Please try again.'), 'EN upload failure text exists');
assert.ok(app.includes('Этот формат файла не поддерживается.'), 'RU unsupported text exists');
assert.ok(app.includes('This file format is not supported.'), 'EN unsupported text exists');
assert.ok(app.includes('Размер файла превышает допустимый лимит.'), 'RU size text exists');
assert.ok(app.includes('The file exceeds the allowed size limit.'), 'EN size text exists');

assert.ok(app.includes('logChatAttachmentFailure'), 'safe attachment failure logger exists');
assert.ok(app.includes('stage,') && app.includes('httpStatus') && app.includes('bucket: chatAttachmentBucket') && app.includes('mime:') && app.includes('size:') && app.includes('path:'), 'safe logger contains allowed fields');
assert.ok(!app.includes('signedUrl') || app.includes('attachment.signed_url = data?.signedUrl || \'\''), 'signed URL is not logged');
assert.ok(app.includes('chatAttachmentPreviewUrls = new WeakMap()'), 'preview object URLs are tracked');
assert.ok(app.includes('URL.revokeObjectURL(url)'), 'preview object URLs are revoked');
assert.ok(app.includes('name.textContent = file.name'), 'preview filename uses textContent');
assert.ok(!chatClientCode.includes('message.failed ? \' · ошибка\''), 'failed state is not appended to client sender label');
assert.ok(app.includes('data-chat-retry') && app.includes('data-chat-delete-unsent'), 'failed UI includes retry and delete controls');
assert.ok(chatClientCode.includes('body,') && !chatClientCode.includes('body: body || (file?.name || \'\')'), 'file name is not saved as fallback message body in client optimistic UI');

assert.ok(draftSql.includes("name like 'chat/%'"), 'draft SQL prepares future chat/{conversationId}/ attachment path');
assert.ok(!draftSql.includes("'image/gif'"), 'draft SQL removes GIF from bucket allow-list');

console.log('chat-attachments-static: ok');
