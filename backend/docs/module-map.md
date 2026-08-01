# Backend module map

| Directory | Current status | Future responsibility |
|---|---|---|
| `config/` | Ready | Central defaults and environment loader |
| `core/` | Ready | Application, DI, logger, errors, context, flags, health |
| `api/` | Ready framework plus disabled Lead API | Version-aware routing and future transport adapters |
| `providers/` | Interface ready | DB/storage/auth/notification/realtime/consent/routing providers |
| `auth/` | Placeholder | Auth service implementation later |
| `chat/` | Placeholder | Chat service implementation later |
| `crm/` | Placeholder | Lead/support/review domain services later |
| `storage/` | Placeholder | Storage orchestration later |
| `notifications/` | Placeholder | Minimal notification services later |
| `consents/` | Placeholder | Consent recording/query services later |
| `routing/` | Ready internal engine | Server-side route policy, preview descriptor, region lock contract |
| `middleware/` | Placeholder | Request context, auth, rate limit middleware later |
| `repositories/` | Placeholder | Persistence adapters later |
| `services/` | Placeholder | Application services later |
| `controllers/` | Not implemented | Controllers later, dependencies through DI only |
| `validation/` | Placeholder | Request schema validation later |
| `types/` | Ready | JSDoc contracts |
| `utils/` | Minimal | Shared pure helpers |
| `logs/` | Empty | Runtime logs excluded from code flow |
| `tests/` | Ready | Structure/import/build checks |
| `docs/` | Ready | Backend architecture docs |
