# Dual-region migration plan

0. Freeze current facts. Prerequisite: Supabase region confirmed. Rollback: none. Accept: report says `CRITICAL_LOCALIZATION_BLOCKER_FOR_RUSSIA`.
1. Add feature flags and neutral API interfaces. Rollback: disable flags. Accept: production behavior unchanged.
2. Add country selector. Rollback: remove required flag or hide with feature flag if conversion issue. Accept: forms do not submit without country.
3. Implement server route preflight. Rollback: keep legacy mode. Accept: no personal data in preflight.
4. Build RU backend schema. Rollback: drop non-production environment. Accept: migrations pass in staging.
5. Build RU auth provider. Rollback: disable RU auth flag. Accept: no RU password reaches Supabase.
6. Build RU storage provider. Rollback: disable uploads for RU. Accept: RU file never hits Supabase Storage.
7. Build RU chat API. Rollback: RU chat maintenance response. Accept: no Supabase fallback after RU route.
8. Build international API facade over Supabase. Rollback: direct legacy mode. Accept: international behavior matches current site.
9. Build admin aggregation API. Rollback: use current admin for international only. Accept: region explicit on every object/action.
10. Sanitize notifications. Rollback: disable notifications. Accept: Telegram contains only anonymous event facts.
11. Add CSP/connect-src route profiles. Rollback: report-only CSP. Accept: RU browser sessions cannot connect to denied hosts.
12. Localize legal documents. Rollback: keep draft blocker. Accept: RU and EN routes do not overclaim compliance.
13. Staging migration dry run. Rollback: discard staging data. Accept: test plan passes.
14. Production cutover by flag cohort. Rollback: turn off RU flags before new RU records, or maintenance for RU after records exist. Accept: monitored no-denylist leaks.
15. Post-cutover audit. Rollback: incident process. Accept: logs, backups, admin actions, and deletion flows verified.

Key risks: bad route classification, accidental Supabase fallback, admin copying RU data abroad, logs containing personal data, file preview leaks, legal text overclaiming US/RU compliance, and operational immaturity of a new provider.
