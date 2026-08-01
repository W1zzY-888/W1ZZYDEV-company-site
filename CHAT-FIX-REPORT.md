# W1ZZYDEV Chat Fix Report

Status: CHAT_FIX_PARTIALLY_READY_DB_DRAFT_REQUIRED

## 1. Scope

Fixed frontend-safe chat issues in the existing production project without commit, push, deploy, production SQL, Supabase disconnect, app flow rewrite, or production frontend switch.

## 2. Reproduced Causes

- Assistant language bug: public chat automatic copy used global UI `lang`, so switching the page language after a chat started could change assistant quick replies and assistant Edge Function locale for the existing session.
- Attachment failure UI bug: failed client messages appended `· ошибка` to the sender label and used the attachment filename as message body fallback.
- Attachment security gap: frontend allowed GIF and trusted MIME alone more than MIME+extension.
- Attachment preview lifecycle gap: preview object URLs were revoked only by timeout, not explicitly on reset/replacement.

## 3. Files Changed

- `app.js`
- `backend/package.json`
- `backend/tests/run-all.js`
- `backend/tests/chat-locale-static.test.js`
- `backend/tests/chat-attachments-static.test.js`
- `supabase/migrations/20260731_001_chat_locale_attachments_draft.sql`
- `CHAT-FIX-REPORT.md`

## 4. Chat Locale Fix

- Added active chat session locale (`ru`/`en`) as chat state.
- New sessions take locale from current site language.
- Restored sessions keep saved locale.
- Empty not-started chat can still follow explicit UI language switch.
- Assistant Edge Function now receives `currentChatLocale()`, not raw UI `lang`.
- Quick reply labels render from chat session locale.
- Required RU/EN greeting text is present in frontend dictionary.

## 5. Attachment Fix

- Bucket remains `chat-attachments`.
- 10 MB limit preserved.
- Allowed frontend formats: PNG, JPG/JPEG, WEBP, PDF, DOCX, XLSX.
- Disallowed dangerous extensions: HTML, HTM, SVG, JS, MJS, EXE, DMG, PKG, ZIP.
- Validation now checks MIME + extension.
- Safe upload path uses existing production-compatible policy prefix plus opaque UUID filename.
- Original filename is sanitized and kept only as display metadata.
- Preview filename uses `textContent`.
- Preview object URLs are revoked on replace/reset/clear.
- Failed client UI no longer puts `ошибка` into sender/name line.
- Failed client UI shows status plus Retry/Delete controls.

## 6. Logging

Attachment failure debug logging is sanitized and limited to:

- stage
- code
- HTTP status
- bucket
- MIME
- size
- sanitized path
- requestId if available

No tokens, authorization headers, cookies, signed URLs, email, phone, name, message body, or full IP are logged.

## 7. Storage/RLS Decision

Current production SQL policy allows `guest/%` and `owner/%`. Changing frontend immediately to `chat/{conversationId}/{messageOrUploadId}/{uuid}.{ext}` would break uploads unless Storage policy is changed.

Prepared but did not apply:

- `supabase/migrations/20260731_001_chat_locale_attachments_draft.sql`

It documents future `chat/%` path support, conversation locale, and GIF removal from bucket MIME allow-list.

## 8. Known DB Limitation

`public.chat_guest_assistant_action` currently hardcodes Russian assistant responses in SQL. Full DB-persisted EN quick replies require a production SQL migration later.

No production SQL was applied.

## 9. Tests Added

- `backend/tests/chat-locale-static.test.js`
- `backend/tests/chat-attachments-static.test.js`

## 10. Verification

Passed:

- `node --check app.js`
- `node backend/tests/chat-locale-static.test.js`
- `node backend/tests/chat-attachments-static.test.js`
- `npm run check`
- `npm run test:routing`
- `npm run test:leads`
- `npm run test:persistence`
- `npm run test:cookie-consent`
- `npm run test:legal-security`
- `npm run build`

Root `package.json` is absent, so project validation was run from `backend/`.

## 11. Not Done

- No commit.
- No push.
- No deploy.
- No production SQL applied.
- No Supabase production flow changes.
- No frontend rewrite.
- No DB/RLS policy applied.

## 12. Final Status

CHAT_FIX_PARTIALLY_READY_DB_DRAFT_REQUIRED

Frontend-safe fixes are implemented and tested. Full DB persistence for English quick assistant replies remains blocked until the prepared SQL design is reviewed and applied in a later explicit database stage.
