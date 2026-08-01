# Lead API Contract

## Feature Flag

`LEAD_API_ENABLED=false`

## Create

`POST /api/v1/leads`

Input metadata only plus lead payload:

```json
{
  "selectedCountry": "Russia",
  "serverCountryCode": "RU",
  "phone": "+7...",
  "locale": "ru-RU",
  "name": "Name",
  "contactType": "EMAIL",
  "contactValue": "name@example.com",
  "message": "Project request",
  "consentId": "opaque-consent-id",
  "attachmentsCount": 0,
  "source": "WEBSITE",
  "language": "ru",
  "metadata": {},
  "clientRequestId": "11111111-1111-4111-8111-111111111111"
}
```

`routeRegion` is not accepted from clients.

`clientRequestId` is optional and must be a UUID. It is used only for idempotency and is not returned in public DTOs.

## Read

`GET /api/v1/leads/{publicToken}`

Uses opaque public token, not internal id.

## Update

`PUT /api/v1/leads/{publicToken}`

Allowed fields:

- `status`
- `message`
- `metadata`

Status values:

- `NEW`
- `IN_PROGRESS`
- `WAITING_CLIENT`
- `COMPLETED`
- `CLOSED`

## Delete

`DELETE /api/v1/leads/{publicToken}`

Deletes from the in-memory repository only.

## Response

Success:

```json
{
  "ok": true,
  "data": {}
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "LEAD_VALIDATION_ERROR",
    "message": "Lead validation failed",
    "requestId": "..."
  }
}
```

Errors do not expose stack traces.
