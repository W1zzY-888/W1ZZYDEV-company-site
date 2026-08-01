# Data routing contract

This is a technical risk-minimization policy. It does not determine citizenship and must not be presented as legal proof of residency, nationality, or consumer status.

## Inputs

- User-selected service country: `RU`, `US`, `OTHER`.
- Server-side IP country.
- UI locale.
- Phone code.
- Saved session region.
- Existing record region.

The frontend may collect the selected country before personal data, but the server is authoritative.

## Rules

1. Explicit country Russia -> `RU`.
2. Server-side IP country `RU` -> `RU`.
3. Phone starts with `+7` and country is not confirmed as Kazakhstan -> `RU`.
4. Conflicting signals -> `RU`.
5. Insufficient signals on Russian-language site -> `RU`.
6. Existing lead, chat, ticket, account, request, or file keeps its original route forever.
7. User-supplied route values are ignored unless bound by the server.
8. Route is signed server-side or bound to an opaque public token.
9. Frontend never receives internal DB IDs for public chat/ticket access.
10. Existing conversations/accounts are never automatically moved between databases.

## Server responsibilities

- Evaluate IP and existing token/account region before accepting personal data.
- Return only opaque public tokens and route labels safe for UI.
- Store route decision reason, version, timestamp, and verifier.
- Reject mismatched route attempts instead of silently falling back.
- Treat missing RU backend after `RU` route as service unavailable, not as permission to use Supabase.
