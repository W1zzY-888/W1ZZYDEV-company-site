# Lead Database Schema

Migration: `backend/database/migrations/20260729_001_leads.sql`.

The staging table `leads` includes:

- UUID primary key.
- `public_token_hash`, unique.
- immutable `region` with `RU` / `INTERNATIONAL` check.
- lead payload fields.
- status check.
- consent reference.
- metadata `jsonb`.
- soft delete `deleted_at`.
- routing policy version, reason, and confidence.
- indexes on region, status, created_at.

The migration adds a trigger that rejects `region` updates after insert.

Public API DTOs never expose internal `id`.
