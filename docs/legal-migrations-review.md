# Legal migrations review

Date: 2026-07-29. Production SQL was not applied.

## 20260728_001_legal_consents.sql

- Purpose: create legal document registry, immutable consent evidence table and `register_legal_consent` RPC.
- Dependencies: `pgcrypto`, existing `public.is_owner()`, existing `public.safe_request_ip()`.
- Risk: Medium. Missing `safe_request_ip()` or `is_owner()` will fail if base chat/admin schemas are not applied. Public can select active legal documents. Consent snapshots are owner-only by RLS.
- Lock time: short DDL locks for new tables/functions.
- Rollback: drop functions `register_legal_consent`, `legal_hmac_sha256`, `legal_reduced_user_agent`; drop tables `legal_consents`, `legal_documents`.
- Preflight: `select proname from pg_proc where proname in ('is_owner','safe_request_ip');`
- Post-deploy: anon cannot select `legal_consents`; owner can; anon can execute `register_legal_consent` only with allowlisted purpose/form/document.
- 42702 review: table references in function should be further alias-qualified in `select * into doc from public.legal_documents where document_type = p_document_type`; low risk but should be changed before live if strict 42702 policy is required.
- Status: NEEDS_FIX before production.

## 20260728_002_data_subject_requests.sql

- Purpose: create `data_subject_requests` and RPC for public request creation with consent logging.
- Dependencies: migration 001.
- Risk: Medium. Frontend `/legal/data-request/` depends on this RPC; without it form is frontend-present but not server-functional.
- Lock time: short DDL locks for new table/function.
- Rollback: drop function `create_data_subject_request`; drop table `data_subject_requests`.
- Preflight: migration 001 installed; `register_legal_consent` callable.
- Post-deploy: anon can create request by RPC; anon cannot select list; owner can manage.
- 42702 review: insert/returning uses local `request_id`; no ambiguous output column detected.
- Status: READY for staging, PENDING_DATABASE_MIGRATION for site behavior.

## 20260728_003_consent_required_rpc_wrappers.sql

- Purpose: originally intended to enforce consent in chat RPC.
- Review result: previous implementation was unsafe because it changed `chat_guest_send` signature and required repeated consent on every message.
- Current file: no-op marker with explicit `raise notice`.
- Risk: Low as no-op; does not implement server enforcement.
- Lock time: none meaningful.
- Rollback: no-op.
- Preflight: none.
- Post-deploy: notice only.
- Status: BLOCKED. Needs a new migration after local schema reproduction/read-only live RPC review.

## 20260728_004_retention_dry_run.sql

- Purpose: create retention action log and owner-only dry-run archive helper.
- Dependencies: `public.is_owner()`, `public.conversations` with `updated_at`, `archived_at`, `deleted_at`, `archived_by`.
- Risk: Medium. It assumes archive columns exist from prior chat archive migrations.
- Lock time: short DDL locks for new table/function; update only when `p_dry_run=false`.
- Rollback: drop function `retention_archive_conversations`; drop table `data_retention_actions`.
- Preflight: check columns on `public.conversations`.
- Post-deploy: non-owner cannot execute; dry-run returns at most `p_limit` rows; no cron enabled.
- 42702 review: aliases used in main queries; no destructive delete.
- Status: READY for staging if dependencies exist.

## Local SQL verification

Supabase CLI and Docker are not installed in this environment, so local database reproduction was not possible.

Status: BLOCKED: REPOSITORY CANNOT REPRODUCE DATABASE SCHEMA in this environment.
