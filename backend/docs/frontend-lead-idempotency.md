# Frontend Lead Idempotency

The frontend generates `clientRequestId` before submit using `crypto.randomUUID()` when available.

Rules:
- It contains no PII.
- It is not the public token.
- It is not stored longer than the submit attempt.
- It is not sent to analytics or logs.

Backend validation accepts UUID formatted `clientRequestId`.

Staging migration `20260729_002_lead_idempotency.sql` adds:
- `leads.client_request_id`
- unique index on `(region, client_request_id)` for non-deleted rows.

Replay scope is regional: the same request id in the same backend-resolved region returns the existing record instead of creating a duplicate.
