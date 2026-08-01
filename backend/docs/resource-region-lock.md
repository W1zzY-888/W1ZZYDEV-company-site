# Resource Region Lock

`RegionLock` is a contract for resources that already exist:

- conversation
- lead
- support ticket
- client account
- review
- privacy request
- attachment

Fields:

- `resourceType`
- `publicResourceToken`
- `region`
- `createdAt`
- `policyVersion`

Rules:

- Existing resource region is immutable.
- Browser-provided route values cannot override the server-known region.
- Future lookup must use an opaque public token, not an internal DB ID.
- Internal DB IDs must not be exposed in public browser routes.
- The current implementation does not read from a database; it only defines the contract and policy behavior.
