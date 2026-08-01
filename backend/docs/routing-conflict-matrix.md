# Routing Conflict Matrix

Locale is a weak signal and does not override confirmed country signals.

| Selected country | Server country | Phone signal | Conflict | Result |
|---|---|---|---|---|
| `US` | `RU` | any | Strong conflict | `RU` by server-country rule before conflict fallback |
| `RU` | `US` | any | Strong conflict | `RU` by selected-country rule before conflict fallback |
| `OTHER` | non-RU/unknown | `+7` | Strong conflict | `RU` by phone rule |
| `US` | non-RU/unknown | `+7` | Strong conflict | `RU` by phone rule |
| `US` | `US` | Russian locale | No strong conflict | `INTERNATIONAL`; locale does not override confirmed US |
| `KZ` | unknown/non-RU | `+7` | No phone-RU conflict | Continue to locale/default rules |
| existing resource region | any | any | Not a conflict | Existing region lock wins |

Safe RU fallback is used when strong signals disagree and no higher-priority rule has already resolved the route.
