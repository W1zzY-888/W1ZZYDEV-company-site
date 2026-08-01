# Routing Policy 2026-07-v1

Policy version: `2026-07-v1`.

This policy chooses a technical processing region. It does not prove citizenship.

## Inputs

- `selectedCountry`
- `serverCountryCode`
- `phone`
- `locale`
- `existingResourceRegion`
- `existingResourceId`
- `requestId`

No form payload fields such as name, email, message, file, password, cookies, or authorization headers are part of `RoutingInput`.

## Ordered Rules

1. Existing resource lock wins. If `existingResourceRegion` is present, return that region with `immutable=true` and `EXISTING_RESOURCE_LOCK`.
2. User-selected Russia routes `RU`, confidence `HIGH`, reason `USER_SELECTED_RUSSIA`.
3. Server-side country `RU` routes `RU`, confidence `HIGH`, reason `SERVER_IP_RUSSIA`.
4. `+7` phone routes `RU`, confidence `MEDIUM`, reason `PHONE_CODE_RUSSIA`, unless selected country is explicitly `KZ`.
5. Strong-signal conflict routes `RU`, confidence `MEDIUM`, reason `CONFLICT_SAFE_RU`.
6. Russian locale without sufficient international confirmation routes `RU`, confidence `LOW`, reason `RUSSIAN_LOCALE_DEFAULT`.
7. Selected `US` and server country not `RU` routes `INTERNATIONAL`, confidence `HIGH`.
8. Selected other non-RU country and server country not `RU` routes `INTERNATIONAL`, confidence `MEDIUM`.
9. Insufficient English/default input routes `INTERNATIONAL`, confidence `LOW`, reason `GLOBAL_DEFAULT`.
10. Invalid or unsafe input does not throw; it routes `RU`, confidence `LOW`, reason `INVALID_INPUT_SAFE_RU`.

## Evaluated Signals

Results include only safe normalized metadata:

- `selectedCountryCode`
- `serverCountryCode`
- `phoneCountryClassification`
- `localeClassification`
- `existingResourceRegionPresent`

The full phone number is never stored or logged.
