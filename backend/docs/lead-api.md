# Lead API

Status: `LEAD_API_READY` for backend-internal use only. The API is not connected to production frontend and does not write to Supabase or any real database.

## Endpoints

Registered route descriptors:

- `POST /api/v1/leads`
- `GET /api/v1/leads/{publicToken}`
- `PUT /api/v1/leads/{publicToken}`
- `DELETE /api/v1/leads/{publicToken}`

All endpoints are disabled by default with `LEAD_API_ENABLED=false`.

## Components

- `LeadController`
- `LeadService`
- `LeadValidator`
- `LeadRepository` interface
- `InMemoryLeadRepository`
- `LeadDTO`
- `LeadMapper`
- `LeadFactory`
- `LeadErrors`
- `LeadContracts`
- `LeadTypes`

## Model

The universal Lead model contains:

- `id`
- `publicToken`
- `country`
- `region`
- `name`
- `contactType`
- `contactValue`
- `message`
- `status`
- `createdAt`
- `updatedAt`
- `consentId`
- `attachmentsCount`
- `source`
- `language`
- `metadata`

`id` is internal and is not returned in DTOs.

## Storage

Default runtime uses `InMemoryLeadRepository`. PostgreSQL-compatible persistence is available through `PostgresLeadRepository` for staging preparation, but no real database is connected by default. There is no Supabase repository.

## Routing

`LeadService.create()` always calls `RoutingProvider` before creating a lead. The client cannot pass trusted `routeRegion`; unexpected fields are rejected by validation.
