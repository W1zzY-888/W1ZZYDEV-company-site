# RU Staging Security

Hardening:
- non-root backend user;
- no privileged containers;
- Docker socket not mounted;
- capabilities dropped;
- read-only root filesystem where possible;
- writable tmpfs only;
- pinned base images, no `latest`;
- JSON log rotation;
- max payload enforced;
- staging synthetic marker required;
- stack traces hidden behind safe errors;
- reverse proxy blocks debug/test/internal routes.

Field encryption:
- `noop_test_only` and `disabled` are forbidden in RU staging startup.
- package expects external KMS/envelope provider configuration.
- startup fails closed if provider config is missing.

Rate limiting:
- Nginx and backend memory limiter are prepared.
- app logs use redacted network key, not raw IP.
