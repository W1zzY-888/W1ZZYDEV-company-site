# RU Staging Deployment

Deployment mode: Docker Compose.

Package path: `backend/deploy/ru-staging`.

Local validation:
- `npm run deploy:ru:validate`
- `npm run deploy:ru:config-check`
- `npm run deploy:ru:compose-check`
- `npm run deploy:ru:security-check`
- `npm run deploy:ru:smoke`

Remote deployment requires owner-provided SSH/server credentials and real secret files. No remote deployment is attempted without them.

Domain placeholder: `ru-api-staging.example.com`.

DNS requirements:
- create A/AAAA records for the staging server;
- issue TLS only after the real domain resolves;
- verify renewal separately with the chosen ACME/tooling.
