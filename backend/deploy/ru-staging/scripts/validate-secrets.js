import { access, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('deploy/ru-staging');
const required = [
  'secrets/ru_postgres_password.txt',
  'secrets/ru_database_url.txt',
  'secrets/public_token_hash_secret.txt',
  'secrets/field_encryption_provider_config.json',
  'secrets/backup_encryption_secret.txt'
];

let ok = true;
for (const file of required) {
  try {
    await access(resolve(root, file), constants.R_OK);
    const details = await stat(resolve(root, file));
    const present = details.size > 0;
    console.log(JSON.stringify({ operation: 'secret.validate', file, present }));
    ok = ok && present;
  } catch {
    console.log(JSON.stringify({ operation: 'secret.validate', file, present: false }));
    ok = false;
  }
}

if (!ok) throw new Error('Required RU staging secrets are missing');
