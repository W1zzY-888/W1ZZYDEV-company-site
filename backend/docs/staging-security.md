# Staging Security

- Do not use real names, emails, phones, messages, files, or customer data.
- Synthetic marker is required through `X-W1ZZYDEV-Synthetic-Test: true`.
- `NODE_ENV=production` forbids staging server, reset, noop encryption, and test bypass.
- Database URLs and secrets are never printed by scripts.
- Smoke output masks public tokens and does not print lead content.
- This environment is local staging only, not production dual-region infrastructure.
