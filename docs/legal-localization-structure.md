# Legal localization structure

Recommended public structure:

- `/ru/legal/`
- `/ru/legal/privacy/`
- `/ru/legal/personal-data-consent/`
- `/ru/legal/cookies/`
- `/ru/legal/terms/`
- `/ru/legal/data-request/`
- `/en/legal/`
- `/en/legal/privacy/`
- `/en/legal/consent/`
- `/en/legal/cookies/`
- `/en/legal/terms/`
- `/en/legal/data-request/`

Alternative: keep `/legal/*` as current canonical draft pages and route content by locale, but this is weaker for SEO and legal clarity. Prefer explicit `/ru` and `/en` paths before dual-region launch.

## Russian policy content

- Operator details after owner fills legal requisites.
- RU contour description: primary recording in Russian PostgreSQL/object storage/auth.
- Categories of personal data by flow.
- Purposes and legal bases.
- Processors and infrastructure physically located in Russia.
- International processors only if assessed and disclosed.
- Cross-border transfer section with explicit blocker if any RU personal data can leave RU.
- Retention, deletion, access, correction, withdrawal, incident contact.
- Notification statement: Telegram/admin alerts are anonymized and do not contain personal data.

## English policy content

- Categories of personal information.
- Purposes of processing.
- Service providers and processors.
- Retention.
- Security.
- User rights workflow.
- State-specific rights only after applicability assessment.
- Children’s data statement.
- International transfer and hosting statement.
- Contact channel.

Do not claim CCPA/CPRA or state privacy compliance until `docs/us-privacy-applicability-checklist.md` is completed.
