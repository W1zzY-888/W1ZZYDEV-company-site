# RU Staging Rollback

Rollback script: `deploy/ru-staging/scripts/rollback-ru-staging.sh`.

Rules:
- requires `PREVIOUS_DEPLOYMENT_VERSION`;
- validates application health after rollback;
- does not perform automatic destructive DB rollback;
- migration rollback requires manual compatibility review.

If a migration is backward incompatible, application rollback must be blocked or accompanied by a documented compatibility plan.
