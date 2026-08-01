# LEGAL AND SECURITY REPORT

Status: local production-ready cleanup completed without deploy.

This is a technical implementation and audit report, not a legal guarantee.

## Pages Kept

- `/legal/` - legal center with document cards.
- `/legal/privacy/` - privacy policy with safeguards section.
- `/legal/personal-data-consent/` - personal data consent.
- `/legal/cookies/` - cookie and similar technologies policy.
- `/legal/terms/` - terms of use.
- `/legal/data-request/` - personal data request form.

## Pages Hidden Or Merged

- `/legal/security/` is kept as a safe noindex compatibility page and points users to the safeguards section in `/legal/privacy/`.
- It no longer exposes internal security architecture details.

## Changed Files

- `assets/js/legal-config.js`
- `app.js`
- `styles.css`
- `legal/index.html`
- `legal/privacy/index.html`
- `legal/personal-data-consent/index.html`
- `legal/cookies/index.html`
- `legal/terms/index.html`
- `legal/data-request/index.html`
- `legal/security/index.html`
- `backend/package.json`
- `backend/scripts/build-legal-pages.js`
- `backend/tests/cookie-consent-static.test.js`
- `backend/tests/legal-security-static.test.js`

## Legal Config

Single source: `assets/js/legal-config.js`.

It now contains structured `operator`, `website`, and `services` objects. Missing owner details are not faked and are tracked in `missingRequiredForOwnerReview` for local/development review.

## Factually Detected Forms And Data

- Project forms: name, contact method, contact value, project type, budget, message, country, consent.
- Support form: name, optional contact, project, priority, subject, description, country, consent.
- Public chat: name/contact/topic/messages, optional attachments, guest session token/hash.
- Client area: email auth, messages, selected conversations.
- Reviews: name, company, rating, review text, moderation status, separate publication consent.
- Moderation/admin panel: owner email/password sign-in, protected work views, owner replies, attachments.
- Data request form: name, email, request type, description, consent.

## External Services

- GitHub Pages/static hosting.
- Supabase Database/Auth/RPC/Realtime/Storage.
- jsDelivr CDN for Supabase SDK and devicons.
- Telegram, WhatsApp, Instagram external contact links.
- Email through `mailto:w1zzydev.studio@gmail.com`.

Analytics and marketing pixels were not found in frontend HTML/JS.

## Operator Details To Fill

- Operator legal type.
- Full owner/legal name.
- INN.
- OGRN/OGRNIP.
- Address.
- Dedicated personal-data email if different from the site email.
- Phone.
- Country.
- Approved retention periods.

## RU/EN

Legal pages use matching `data-ru` / `data-en` content. Existing `setLang()` updates page text, `html lang`, title, meta description, placeholders, and open cookie dialog text without reload.

## Theme And Cookie UI

- Cookie modal uses isolated component variables.
- Secondary and primary buttons have explicit contrast.
- Analytics and Marketing are disabled because no corresponding tools are present.
- `Accept all available` enables only functional storage.
- Modal blocks background scroll, traps focus, closes with Escape, and hides chat launchers while open.

## Cursor Stacking

- Cursor elements are appended to `body`.
- CSS z-index scale added: `--z-overlay`, `--z-modal`, `--z-cursor`.
- Cursor layer is above cookie modal and has `pointer-events: none`.
- Global `cursor:none` applies only after `html.custom-cursor-ready`.
- Touch and `prefers-reduced-motion` use system cursor.

## Security Findings

- No service role key found in frontend files checked by the new static test.
- `.env.example` contains placeholders only.
- Public Supabase anon usage remains in existing legacy frontend flow.
- User-generated chat/review/admin content paths mostly use escaping helpers before `innerHTML`; this remains an area to keep testing because the app still uses template rendering.
- Attachment client checks restrict MIME and size; local SQL indicates private bucket/signed URL approach, but no antivirus scanning is present.

## Supabase RLS And Storage

Only local SQL/files were audited. No production SQL was executed.

Local SQL includes RLS enablement, owner checks, RPCs, private attachment bucket setup, allowed MIME types, size limit, signed URL use, and attachment path validation. Supabase project region could not be verified locally.

## GitHub Pages Limits

GitHub Pages cannot fully control arbitrary HTTP security headers like a custom server or reverse proxy. Meta referrer and Permissions-Policy were added where useful, but strict CSP headers need staged testing because current pages still use inline JSON-LD and some inline event attributes.

## Tests

Passed:

- `node --check app.js`
- `node --check backend/scripts/build-legal-pages.js`
- `node --check backend/tests/legal-security-static.test.js`
- `npm run check`
- `npm run test:routing`
- `npm run test:leads`
- `npm run test:persistence`
- `npm run test:frontend-leads`
- `npm run test:cookie-consent`
- `npm run test:legal-security`
- `npm run build`
- `npm run lint --if-present`
- local route smoke: all legal routes returned HTTP 200

Not completed:

- `RUN_POSTGRES_INTEGRATION_TESTS=true npm run test:postgres` failed because Docker socket was unavailable at `/Users/maxim/.docker/run/docker.sock`.
- `npm audit --omit=dev` failed with `ENOLOCK` because `backend` has no lockfile. No lockfile was created.

## Local Preview

```sh
cd /Users/maxim/Documents/W1ZZYDEV-company-site
python3 -m http.server 8080 --bind 127.0.0.1
```

Manual URLs:

- `http://127.0.0.1:8080/legal/`
- `http://127.0.0.1:8080/legal/privacy/`
- `http://127.0.0.1:8080/legal/personal-data-consent/`
- `http://127.0.0.1:8080/legal/cookies/`
- `http://127.0.0.1:8080/legal/terms/`
- `http://127.0.0.1:8080/legal/data-request/`
- `http://127.0.0.1:8080/legal/security/`
- `http://127.0.0.1:8080/contact/`
- `http://127.0.0.1:8080/support/`
- `http://127.0.0.1:8080/reviews/`
- `http://127.0.0.1:8080/client/`
- `http://127.0.0.1:8080/reviews/moderation/`
- `http://127.0.0.1:8080/reviews/reset-password/`
