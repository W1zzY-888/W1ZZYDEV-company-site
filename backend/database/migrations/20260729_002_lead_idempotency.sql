-- Staging-only migration. Do not apply to production without owner approval.

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS client_request_id text;

CREATE UNIQUE INDEX IF NOT EXISTS leads_region_client_request_id_uidx
ON leads(region, client_request_id)
WHERE client_request_id IS NOT NULL AND deleted_at IS NULL;
