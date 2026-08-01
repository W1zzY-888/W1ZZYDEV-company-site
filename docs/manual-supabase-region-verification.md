# Manual Supabase region verification

Status: NOT_VERIFIED.

Supabase CLI is not installed in this environment, so region cannot be verified from an authenticated Supabase control plane here. Do not paste Supabase access tokens, service role keys, JWTs, passwords or API keys into chat or repository files.

## Project to verify

- Project ref: `yeyasotjctjlplbrzwzc`
- Project URL: `https://yeyasotjctjlplbrzwzc.supabase.co`
- Local link file: `supabase/.temp/linked-project.json`

## Owner checklist in Supabase Dashboard

Open Supabase Dashboard for project `yeyasotjctjlplbrzwzc` and record screenshots/text values, without keys:

1. Project Settings -> Infrastructure / General / Compute and Disk: project/database region.
2. Database settings: primary database host/region and read replicas, if any.
3. Storage settings: bucket region/location for `chat-attachments` and any other buckets.
4. Edge Functions: region/location, invocation policy and deployed function list.
5. Backups/PITR: backup region, retention and whether PITR is enabled.
6. Network restrictions: allowed networks, custom domains and pooler settings.
7. Logs: location/retention if shown.
8. Integrations: external services connected to project.

## Evidence to provide

- Region value as shown by Supabase control plane.
- Storage location value as shown by Supabase control plane.
- Edge Functions region value as shown by Supabase control plane.
- Backup/PITR location and retention.
- Whether read replicas exist and their regions.
- Confirmation that no screenshots include API keys, JWTs or database passwords.

## Technical indicators gathered locally

These are UNVERIFIED TECHNICAL INDICATOR only and do not prove physical database location:

- DNS for `yeyasotjctjlplbrzwzc.supabase.co` resolved to Cloudflare IPs.
- TLS certificate CN: `supabase.co`; issuer: Google Trust Services.
- Response headers showed `server: cloudflare` and `cf-ray` ending in `FRA`.
- These values may reflect CDN/proxy edge location, not database/Storage/Edge Function region.

## Region status vocabulary

Use only:

- `VERIFIED_FROM_SUPABASE_CONTROL_PLANE`
- `VERIFIED_FROM_AUTHENTICATED_SUPABASE_CLI`
- `NOT_VERIFIED`
- `CONFLICTING_INFORMATION`
