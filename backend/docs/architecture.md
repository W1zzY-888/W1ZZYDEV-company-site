# W1ZZYDEV Backend Core Framework

Status: `BACKEND_CORE_READY` for framework scaffolding only. The backend is not connected to the public site and must not receive real user traffic until a later migration stage.

## Purpose

The framework creates an independent backend layer for future dual-region work while current production continues through the existing Supabase frontend flow. This stage contains architecture primitives, contracts, configuration, validation checks, and an internal Routing Engine. It does not contain Auth, Chat, CRM, Storage, Notification delivery, Controller, real API, DB, or business implementations.

## Runtime model

- ESM JavaScript with JSDoc contract types.
- No external runtime dependencies.
- No production migrations.
- No listener/server boot command.
- No import from the existing frontend.
- No write path connected to Supabase or RU infrastructure.

## Core components

- `Application`: composition root for backend core.
- `Config`: immutable centralized configuration object.
- `EnvironmentLoader`: maps environment variables into config.
- `Container`: dependency injection container.
- `service-manifest`: automatic core service registration.
- `Logger`: structured logger with personal-data redaction keys.
- `FeatureFlagManager`: centralized flag snapshot and reads.
- `RequestContextFactory`: request context with request id, timestamp, `ipHash`, country, locale, route region, and feature flags.
- `ResponseFactory`: consistent JSON response envelopes.
- `ErrorHandler`: normalizes backend errors and logs safe metadata.
- `HealthCheck`: framework health snapshot.
- `ApiRouter`: version-aware router that recognizes `/api/v1/` and contains only disabled internal/dev route descriptors.
- `PolicyRoutingProvider`: backend-internal RU/International routing policy implementation.
- `Version`: framework version constant.

## Dependency injection

All core services are registered in `core/service-manifest.js`. Services are resolved through `Container`; controllers and future services must receive dependencies through constructor/factory injection. Future code should not instantiate providers directly inside controllers.

## Feature flags

Defaults:

- `DUAL_REGION_ENABLED=false`
- `RU_DATA_ROUTE_ENABLED=false`
- `DIRECT_SUPABASE_LEGACY_MODE=true`
- `NEW_BACKEND_ENABLED=false`
- `ADMIN_AGGREGATION_ENABLED=false`
- `ROUTING_PREVIEW_ENDPOINT_ENABLED=false`
- `ALLOW_ROUTING_PREVIEW_IN_PRODUCTION=false`

The legacy flag remains true so production behavior continues unchanged. The new backend is off by default.

Routing settings:

- `ROUTING_POLICY_VERSION=2026-07-v1`
- `ROUTING_DEFAULT_RU_FOR_RUSSIAN_LOCALE=true`
- `ROUTING_CONFLICT_SAFE_REGION=RU`
- `TRUSTED_PROXY_ENABLED=false`
- `TRUSTED_COUNTRY_HEADER=`
- `TRUSTED_PROXY_PROVIDER=`
- `ROUTING_DEBUG=false`

## Provider contracts

Prepared interfaces:

- `DatabaseProvider`
- `StorageProvider`
- `AuthProvider`
- `NotificationProvider`
- `RealtimeProvider`
- `ConsentProvider`
- `RoutingProvider`

Most provider contracts remain abstract. `RoutingProvider` is implemented by `PolicyRoutingProvider` for internal routing decisions only.

## Logging policy

The logger emits structured entries and redacts configured keys such as name, email, phone, contact, message, body, password, token, authorization, cookie, file name, IP, and user agent. Future services must log object references, route labels, status, durations, and safe error codes rather than personal data.

## Error system

Prepared errors:

- `BackendError`
- `ValidationError`
- `AuthorizationError`
- `NotFoundError`
- `ConflictError`
- `InfrastructureError`
- `DatabaseError`
- `StorageError`

## Router boundary

`ApiRouter` validates supported API version prefixes like `/api/v1/`. It has no production business routes. The only internal descriptor is `POST /api/v1/internal/routing/preview`, disabled by default and forbidden in production unless explicitly overridden by flags.

## Next implementation stages

1. Add backend transport/server bootstrap behind `NEW_BACKEND_ENABLED`.
2. Implement route preflight controller.
3. Implement RU and international provider implementations.
4. Implement admin aggregation API.
5. Move frontend writes to the neutral Data API only after staging tests pass.
