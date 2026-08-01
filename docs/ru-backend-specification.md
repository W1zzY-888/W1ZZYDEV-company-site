# RU backend specification

Status: design only. Provider selection and production deployment require a separate owner decision.

## Runtime

- Node.js LTS or compatible server runtime.
- PostgreSQL hosted in Russia.
- Private object storage hosted in Russia.
- HTTPS behind reverse proxy.
- Rate limiting by route, IP bucket, account, and public token.
- Structured logs without names, contacts, message bodies, file names, passwords, tokens, IP full values, or user agents.
- Encryption in transit, encrypted disks/backups where provider supports it.
- Backups stored inside Russia.
- Secrets from environment or secret manager, never frontend.
- Versioned migrations and reproducible rollback scripts.
- Health checks for API, DB, storage, queue, notification service.
- Audit log for admin and privacy actions.

## Tables

- `clients`: public/client profile, region, contact hash, auth provider id, timestamps.
- `leads`: client link, project type, description, contact method, status, route reason.
- `conversations`: subject, status, public token hash, region, linked lead/ticket.
- `messages`: conversation id, sender, body, attachments summary, delivery status.
- `support_tickets`: subject, project, priority, description, status.
- `reviews`: name/company/text/rating, moderation status, publication consent marker.
- `conversation_ratings`: conversation id, rating, comment, timestamps.
- `legal_consents`: form, document versions, route, subject reference, acceptance timestamp.
- `data_subject_requests`: request type, subject/contact, description, status, identity verification state.
- `attachments`: owner object, storage path UUID, MIME, size, scan state, retention deadline.
- `admin_activity`: actor, action, region, object type/id, result, timestamp, metadata without personal data.

## Security model

Supabase RLS is not the RU model. The RU API must authorize every request server-side, and PostgreSQL should additionally restrict rows through application roles, views, policies, or stored procedures where useful. Public tokens allow only the specific conversation or request they represent. Admin APIs require MFA-ready authentication, explicit region scoping, least privilege, and audited actions.

## Provider interfaces

`AuthProvider`: `RuAuthProvider`, `SupabaseAuthProvider`.

- RU accounts and passwords stay in RU.
- Passwords are stored only as modern hashes using reviewed libraries.
- Reset tokens are one-time, short-lived, hashed at rest.
- Sessions use `secure`, `httpOnly`, `sameSite` cookies.
- Brute force controls cover login, reset, magic link, registration.
- MFA-ready schema and API extension points.
- Logs never include passwords, password hashes, reset tokens, or sessions.

`StorageProvider`: `RuStorageProvider`, `SupabaseStorageProvider`.

- RU uploads go only through RU API.
- Private buckets/containers only.
- UUID/object-id paths, no user file names in paths.
- MIME allowlist, size limits, extension normalization.
- Signed download URLs generated server-side with short TTL.
- Antivirus quarantine interface before admin/user download.
- Retention and deletion jobs.
- RU storage backups remain in Russia.
- No frontend object storage keys.

`RealtimeProvider`: `RuRealtimeProvider`, `SupabaseRealtimeProvider`.

- RU may use WebSocket, SSE, or polling through RU API.
- Public token is random, hashed at rest, rate-limited, region-bound.
- No DB IDs in browser.
- No access to another conversation by changing token/path.
- No combined RU+international public streams.

## Admin aggregation

The visual admin calls a server-side Admin Aggregation API. Endpoints should include list/search/detail/action routes with explicit `region` and origin object references. RU records are not copied into Supabase. Previews must be minimal, actions route to the origin API, logs omit full personal data, guest tokens are never linked directly, and privileged access requires strict auth/MFA readiness.
