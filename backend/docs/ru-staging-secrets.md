# RU Staging Secrets

Required secrets:
- `RU_DATABASE_URL`
- `POSTGRES_PASSWORD`
- `PUBLIC_TOKEN_HASH_SECRET`
- `FIELD_ENCRYPTION_PROVIDER_CONFIG`
- TLS private key files
- `BACKUP_ENCRYPTION_SECRET`

Allowed delivery:
- Docker secrets files under `deploy/ru-staging/secrets/`;
- mounted root-owned env file;
- external secret manager.

Forbidden:
- secrets in git;
- secrets in images;
- secrets in frontend;
- secrets in logs;
- secrets in Docker labels.

`scripts/validate-secrets.js` checks presence and non-empty size only. It never prints values.
