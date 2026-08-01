-- Staging-only migration. Do not apply to production without owner approval.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token_hash text NOT NULL,
  region text NOT NULL CHECK (region IN ('RU', 'INTERNATIONAL')),
  country text NOT NULL,
  name text NOT NULL,
  contact_type text NOT NULL,
  contact_value text NOT NULL,
  message text NOT NULL,
  status text NOT NULL CHECK (status IN ('NEW', 'IN_PROGRESS', 'WAITING_CLIENT', 'COMPLETED', 'CLOSED')),
  consent_id text NOT NULL,
  attachments_count integer NOT NULL DEFAULT 0 CHECK (attachments_count >= 0 AND attachments_count <= 20),
  source text NOT NULL,
  language text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  routing_policy_version text NOT NULL,
  routing_reason text NOT NULL,
  routing_confidence text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_public_token_hash_uidx ON leads(public_token_hash);
CREATE INDEX IF NOT EXISTS leads_region_idx ON leads(region);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);

CREATE OR REPLACE FUNCTION prevent_leads_region_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.region IS DISTINCT FROM OLD.region THEN
    RAISE EXCEPTION 'lead region is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_region_immutable ON leads;
CREATE TRIGGER leads_region_immutable
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION prevent_leads_region_update();

CREATE OR REPLACE FUNCTION touch_leads_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_touch_updated_at ON leads;
CREATE TRIGGER leads_touch_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION touch_leads_updated_at();
