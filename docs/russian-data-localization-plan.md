# Russian personal data localization plan

Status: required because repository does not verify Supabase location and browser writes personal data directly to `https://yeyasotjctjlplbrzwzc.supabase.co`.

## Blocker

CRITICAL BLOCKER: PERSONAL DATA LOCALIZATION

If the Supabase project is outside Russia, first recording of Russian citizens' personal data appears to happen outside Russia. Legal pages and cookie banners do not fix this architecture.

## Target architecture

Browser user -> Russian backend/API -> Russian primary PostgreSQL -> Russian object storage -> limited onward transfer only after lawful basis, minimization and documented assessment.

## Migration options

- Host application API and PostgreSQL on servers physically located in Russia.
- Use Russian object storage for attachments with private buckets and short signed links.
- Move public forms/chat to Russian API endpoints; do not send personal data to foreign Supabase from browser.
- Migrate Auth to Russian-controlled auth/session storage or a provider with verified Russian primary storage.
- Migrate chat history, leads, reviews, support tickets and consent records from Supabase with checksums.
- Move attachments by bucket export/import; replace paths with UUID-based storage keys.
- Configure backups in Russia first; document any external encrypted copy separately.
- Switch traffic by feature flags: write to Russian API, dual-read if needed, verify, then disable foreign writes.

## What not to do

- Do not build a fake Russian proxy if the browser still writes to foreign Supabase first.
- Do not forward full messages/files to Telegram by default.
- Do not claim completion until physical locations and data flows are evidenced.
