# RU Staging Backup And Restore

Backup:
- `backup/backup.sh`
- PostgreSQL custom dump
- encrypted with `openssl enc -aes-256-cbc -pbkdf2`
- checksum via `sha256sum`
- default retention: 14 days

Restore:
- `backup/restore.sh`
- requires `RESTORE_CONFIRM=RU_STAGING_SYNTHETIC_RESTORE`
- blocks production restore unless `RESTORE_SANITIZED=true`

Backup logs include artifact names and checksums only. They do not include DB URLs, passwords, or raw data.
