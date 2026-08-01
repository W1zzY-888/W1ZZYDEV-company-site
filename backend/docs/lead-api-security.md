# Lead API Security

## Disabled By Default

`LEAD_API_ENABLED=false` by default. Route descriptors exist inside backend only, but handlers return disabled/not found until the flag is explicitly enabled in a non-production staging context.

## Validation

`LeadValidator` checks:

- name presence, trimming, and length.
- contact type enum.
- contact value presence and length.
- selected country presence and length.
- message presence and length.
- consent id presence and length.
- attachment count bounds.
- oversized payload.
- unexpected fields.
- prototype pollution keys.
- simple unsafe HTML/script indicators.

This is not a replacement for future domain-specific validation, spam protection, rate limiting, or auth.

## Logging

Lead logs may contain only:

- `requestId`
- `region`
- `status`
- `result`

Lead logs must not contain name, email, phone, message, full IP, cookies, authorization headers, tokens, or full user-agent.

## Public Token

Public tokens are opaque random values prefixed with `lead_`. They are not DB IDs and are not sequential.

## Limitations

- In-memory repository is not durable.
- No auth.
- No rate limiting middleware.
- No persistence or audit DB.
- No Supabase adapter.
- No frontend integration.
