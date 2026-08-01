# Frontend Lead Integration

Status: staging/canary only. Production default remains `legacy`.

The browser integration is implemented in `assets/js/lead-submission.js` and loaded lazily by `app.js`.

Modes:
- `legacy`: existing Supabase lead flow only.
- `new_api`: new Lead API only, no legacy create.
- `shadow`: legacy create first, then synthetic staging Lead API submit.

Config:
- `FRONTEND_LEAD_SUBMISSION_MODE=legacy`
- `LEAD_API_BASE_URL=`
- `LEAD_API_SYNTHETIC_HEADER_ENABLED=false`
- `ALLOW_FRONTEND_SHADOW_MODE=false`
- `LEAD_API_TIMEOUT_MS=10000`

The frontend may send a selected country, but it never sends `routeRegion`; backend routing remains authoritative.
