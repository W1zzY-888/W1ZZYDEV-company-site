# Operator data to fill

Do not infer these values from git config, macOS username, package metadata or commit history.

| Field | Meaning | Example format, not value | Required | Used in | Confirmer | Status |
|---|---|---|---|---|---|---|
| `LEGAL_OPERATOR_TYPE` | Legal form/type of operator | `ИП` / `ООО` / физлицо as legally applicable | Required | legal pages, policy | Owner/legal counsel | TODO_REQUIRED |
| `LEGAL_OPERATOR_FULL_NAME` | Full legal name | full registered name | Required | policy/consent | Owner | TODO_REQUIRED |
| `LEGAL_OPERATOR_SHORT_NAME` | Short public name | brand or short legal name | Required | UI/docs | Owner | Filled as W1ZZYDEV |
| `LEGAL_OPERATOR_STATUS` | Role/status | operator status wording | Required | policy | Legal counsel | TODO_REQUIRED |
| `LEGAL_OPERATOR_INN` | Tax ID | 10 or 12 digits depending status | Required if applicable | policy/internal docs | Owner | TODO_REQUIRED |
| `LEGAL_OPERATOR_OGRN_OR_OGRNIP` | Registration number | OGRN/OGRNIP numeric format | Required if applicable | policy/internal docs | Owner | TODO_REQUIRED |
| `LEGAL_OPERATOR_ADDRESS` | Registered address | official registered address | Required | policy | Owner | TODO_REQUIRED |
| `LEGAL_OPERATOR_POSTAL_ADDRESS` | Postal address for requests | mailing address | Required | data request/consent | Owner | TODO_REQUIRED |
| `LEGAL_OPERATOR_EMAIL` | General email | email format | Required | footer/contact | Owner | Filled from repo |
| `LEGAL_OPERATOR_PD_EMAIL` | Personal data requests email | dedicated email format | Required | privacy/data request | Owner | TODO_REQUIRED |
| `LEGAL_OPERATOR_PHONE` | Public phone | phone format | Conditional/required by counsel | policy | Owner | TODO_REQUIRED |
| `LEGAL_SITE_DOMAIN` | Website domain | `https://example.com` | Required | canonical/legal docs | Owner | Filled as `https://w1zzydev.com` |
| `LEGAL_PD_REGISTRY_NUMBER` | RKN registry notification number | registry number or not-applicable legal note | Conditional | policy/report | Owner/legal counsel | TODO_REQUIRED |
| retention fields | Approved retention periods | e.g. period + basis, not guessed | Required | retention docs/RPC | Legal counsel | TODO_REQUIRED |
| country fields | Verified hosting/database/storage countries | control plane/contract evidence | Required | reports/policy | Owner/infrastructure | BLOCKER |
