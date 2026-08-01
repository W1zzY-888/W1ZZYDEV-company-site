# Trusted Country Resolution

No real GeoIP database or external API is implemented.

## ServerCountryResolver

Contract result:

- `countryCode`
- `source`
- `trusted`
- `resolvedAt`

## HeaderServerCountryResolver

Disabled by default.

It only reads a configured allowlisted country header when all of these are true:

- `TRUSTED_PROXY_ENABLED=true`
- `TRUSTED_COUNTRY_HEADER` is set
- the deployment has separately verified the proxy/provider

It does not use `x-forwarded-for` to determine country. Cloudflare, Vercel, or any other proxy header is not trusted by name unless explicitly configured.

## StaticServerCountryResolver

Testing-only resolver that returns a fixed country code and performs no network access.
