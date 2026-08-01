# RU Staging Backup

Backups are encrypted PostgreSQL custom dumps.

Rules:
- retention: 14 days by default;
- staging contains synthetic data only;
- logs contain artifact names and checksums, not passwords or DB URLs;
- restore requires `RESTORE_CONFIRM=RU_STAGING_SYNTHETIC_RESTORE`;
- production restore into staging is blocked unless `RESTORE_SANITIZED=true`.
