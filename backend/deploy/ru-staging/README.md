# W1ZZYDEV RU Staging Deployment Package

Status: deployable package, not a remote deployment.

Topology:

Internet -> reverse-proxy -> ru-backend -> ru-postgres

Only `reverse-proxy` publishes host ports. PostgreSQL and backend stay inside the internal Docker network.

Prepare real secrets outside git, then run:

```sh
npm run deploy:ru:validate
npm run deploy:ru:config-check
npm run deploy:ru:compose-check
npm run deploy:ru:security-check
sh deploy/ru-staging/scripts/deploy-ru-staging.sh
```

The package is RU-only. `INTERNATIONAL_DATABASE_MODE=disabled` and there is no INTERNATIONAL database URL in this deployment profile.
