# Lead Persistence Security

## Data Minimization

Lead metadata is allowlisted:

- `campaign`
- `page`
- `referrerCategory`
- `formId`
- `utmSource`
- `utmMedium`
- `utmCampaign`

Raw IP, full user-agent, cookies, headers, and full referrer URLs with query parameters are not accepted as metadata.

## Logs

Allowed audit/log events:

- `lead.created`
- `lead.updated`
- `lead.deleted`
- `lead.persistence_failed`
- `lead.region_repository_unavailable`

Current service log event names are `lead.created`, `lead.updated`, `lead.deleted`, and safe backend errors. Allowed fields are request id, region, status, operation/result, error code, and routing policy version.

Never log name, contact value, message, public token, token hash, IP, consent text, or raw metadata values.

## API Errors

Public errors return structured code, message, and request id only. Stack traces, SQL details, connection strings, database names, usernames, and provider secrets are not returned.
