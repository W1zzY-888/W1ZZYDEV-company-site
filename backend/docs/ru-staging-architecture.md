# RU Staging Architecture

Topology:

Internet -> reverse proxy -> RU Backend API -> RU PostgreSQL

Components:
- `reverse-proxy`: HTTPS-ready Nginx, only public entrypoint.
- `ru-backend`: Backend Core Lead API in RU-only staging mode.
- `ru-postgres`: private PostgreSQL database, no host port.
- `migration`: single-run migration job with advisory lock.
- `backup`: optional encrypted backup job.

INTERNATIONAL backend and database are not deployed on RU staging. Cross-region fallback is intentionally absent.
