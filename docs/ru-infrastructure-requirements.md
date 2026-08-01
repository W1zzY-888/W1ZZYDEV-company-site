# RU infrastructure requirements

Provider is not selected in this stage.

Requirements for candidate providers:

- PostgreSQL physically hosted in Russia with documented region.
- Private object storage physically hosted in Russia.
- TLS termination and certificate management.
- Private networking or firewall controls between API, DB, storage.
- Backup storage and restore operations inside Russia.
- Access logs export with personal-data minimization controls.
- Secrets manager or secure environment variables.
- DDoS/reverse proxy/rate limiting options.
- Admin access MFA, role separation, auditability.
- Data deletion/export support.
- Clear subprocessors, support access model, incident notification terms.
- Ability to run staging and production separately.
- Documented retention, backup retention, and disaster recovery RPO/RTO.
