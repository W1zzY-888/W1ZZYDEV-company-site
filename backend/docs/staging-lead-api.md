# Staging Lead API

Staging endpoints:

- `POST /api/v1/leads`
- `GET /api/v1/leads/:publicToken`
- `PUT /api/v1/leads/:publicToken`
- `DELETE /api/v1/leads/:publicToken`

Staging safety requires:

- `LEAD_API_ENABLED=true`
- `NEW_BACKEND_ENABLED=true`
- `STAGING_SYNTHETIC_DATA_ONLY=true`
- header `X-W1ZZYDEV-Synthetic-Test: true`

The staging server is backend-only and binds to `127.0.0.1`. It does not serve or switch the production frontend.
