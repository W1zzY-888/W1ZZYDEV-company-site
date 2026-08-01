# Routing Security

## Safe By Default

- Routing engine is backend-internal.
- Preview endpoint is disabled by default.
- Production preview is forbidden unless two flags are explicitly enabled.
- No external network calls.
- No Supabase calls.
- No RU database calls.
- No persistence of routing inputs.

## Validation

The validator accepts only route-relevant metadata. It rejects unexpected keys, oversized strings, malformed shapes, and prototype pollution keys. Invalid input returns safe RU fallback through policy.

The public preview helper strips:

- `existingResourceRegion`
- `existingResourceId`
- `routeRegion`

## Logging

Allowed events:

- `routing.decision`
- `routing.conflict`
- `routing.invalid_input`
- `routing.resource_lock`

Allowed fields:

- `requestId`
- `resultingRegion`
- `reason`
- `confidence`
- `policyVersion`
- `conflict`
- `existingResourceLock`

Never log full IP, phone, email, name, message, address, cookies, token, public resource token, authorization, or full user-agent.

When `ROUTING_DEBUG=false`, `evaluatedSignals` are not logged. When enabled, they contain only normalized classifications.
