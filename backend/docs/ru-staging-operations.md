# RU Staging Operations

Useful commands from `backend/`:

```sh
npm run deploy:ru:validate
npm run deploy:ru:config-check
npm run deploy:ru:compose-check
npm run deploy:ru:security-check
npm run deploy:ru:smoke
npm run deploy:migrate
npm run deploy:migration-status
npm run deploy:migration-validate
```

Remote deployment requires:
- server access;
- real DNS;
- real TLS files or issuance flow;
- secret files mounted outside git.

Production traffic must remain on legacy Supabase until a separate owner-approved cutover stage.
