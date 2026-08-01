# Lead Token Security

Public lead tokens are opaque URL-safe random tokens prefixed with `lead_`.

PostgreSQL persistence stores only `public_token_hash`, not plaintext public tokens. Hashing uses HMAC-SHA-256 through `TokenHasher` with:

- `PUBLIC_TOKEN_HASH_SECRET`
- `PUBLIC_TOKEN_HASH_VERSION`

The hash is versioned as `version:digest`. Missing or short secret fails closed. Token verification uses constant-time comparison when applicable.

Tokens, token hashes, and public resource tokens must not be logged.
