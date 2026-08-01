# RU Staging Monitoring

Lightweight monitoring contract:
- backend `/health`
- backend `/ready`
- DB connectivity
- migration state
- process uptime
- disk usage
- backup age
- 5xx count
- latency buckets

Integration points:
- Prometheus target example: `deploy/ru-staging/monitoring/prometheus-targets.example.yml`
- external uptime monitor against `/health` and `/ready`
- log aggregation from JSON Docker logs

No PII, request bodies, raw headers, DB URLs, tokens, or public tokens should be collected.
