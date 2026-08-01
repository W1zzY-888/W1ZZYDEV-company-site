-- Staging rollback only. Do not apply to production without owner approval.

DROP TRIGGER IF EXISTS leads_touch_updated_at ON leads;
DROP TRIGGER IF EXISTS leads_region_immutable ON leads;
DROP FUNCTION IF EXISTS touch_leads_updated_at();
DROP FUNCTION IF EXISTS prevent_leads_region_update();
DROP TABLE IF EXISTS leads;
