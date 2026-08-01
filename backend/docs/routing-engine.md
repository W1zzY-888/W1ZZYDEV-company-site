# Routing Engine

Status: framework-internal only. The engine is not connected to the frontend, Supabase, SQL, or production traffic.

The Routing Engine determines the technical processing contour for future backend requests: `RU` or `INTERNATIONAL`.

It does not determine citizenship, residency, tax status, or legal rights. It is a server-side risk-minimization policy for choosing where personal data should be processed.

## Components

- `PolicyRoutingProvider`: implementation of the existing `RoutingProvider` interface.
- `RoutingPolicy202607V1`: ordered decision policy.
- `CountryNormalizer`: small built-in country normalization, no external country database.
- `PhoneCountryClassifier`: route-signal classifier only, not phone validation.
- `LocaleClassifier`: classifies locale as Russian, English, Other, or Unknown.
- `RoutingConflictDetector`: detects strong-signal conflicts.
- `RegionLock`: contract for immutable region of existing resources.
- `HeaderServerCountryResolver`: trusted-proxy header resolver, disabled by default.
- `StaticServerCountryResolver`: test resolver.
- `RoutingPreviewEndpoint`: internal/dev route preview, disabled by default.

## DI Integration

Registered tokens:

- `routing.provider`
- `routing.serverCountryResolver`
- `routing.previewEndpoint`

All routing services are resolved through the existing `Container`. No global singleton is introduced.

## Request Context

`RequestContextFactory.withRoutingResult(context, result)` returns a backward-compatible context copy with `routeRegion` set to `RU` or `INTERNATIONAL`. Context stores only `ipHash`, not full IP, and never stores phone, email, message body, cookies, tokens, authorization headers, or full user-agent.

## Preview Endpoint

Route descriptor:

`POST /api/v1/internal/routing/preview`

It is registered in the backend router but disabled unless `ROUTING_PREVIEW_ENDPOINT_ENABLED=true`. In production it is still blocked unless `ALLOW_ROUTING_PREVIEW_IN_PRODUCTION=true`. It accepts routing metadata only and strips resource locks from public preview body.

## Future Rule

After a future RU route is resolved, failure of RU backend must not fall back to `INTERNATIONAL`.
