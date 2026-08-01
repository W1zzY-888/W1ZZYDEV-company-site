# Release gate

## Можно публиковать после локальной проверки

- Safe legal links in footer and near forms.
- Legal UI pages marked as draft and without false compliance claims.
- Accessibility/text fixes.
- Cookie/storage settings that do not load optional analytics.
- Telegram `minimal` privacy mode.
- Security fixes that do not depend on unapplied migrations.

## Нельзя считать работающим до применения SQL

- Server-side consent enforcement.
- Legal consent evidence log.
- Data subject request registration.
- Retention procedures.
- New RLS/RPC behavior from legal migrations.

## Нельзя запускать до решения локализации

- Collection of Russian citizens' personal data directly into unverified foreign Supabase.
- Direct file uploads to unverified Supabase Storage.
- Direct Supabase Auth for Russian citizens if infrastructure does not match the selected lawful architecture.

## Current gate status

- Frontend legal UI: PARTIALLY_READY after local browser check.
- Legal release: NOT_READY_FOR_LEGAL_RELEASE.
- Personal data collection: MANUAL_VERIFICATION_REQUIRED / possible CRITICAL_LOCALIZATION_BLOCKER.
