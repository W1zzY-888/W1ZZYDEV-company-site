# Frontend Lead Shadow Mode

Shadow mode keeps the user-visible result on the legacy Supabase path.

After legacy success, the frontend submits only synthetic data to staging:
- `Shadow Test User`
- `shadow-test@example.invalid`
- `Synthetic shadow submission`
- `source=frontend-shadow`

Allowed metadata:
- `formId`
- `page` without query string
- `legacyResult`
- `originalCountryCode`

Real name, contact value, phone, email, message, cookies, tokens, full user-agent, and raw referrer are not copied into shadow payload.

Shadow failures are logged as safe status only and do not fail the user request.
