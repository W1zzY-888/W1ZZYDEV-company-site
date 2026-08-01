import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { backendRoot } from './helpers.js';

const requiredDirectories = [
  'config',
  'core',
  'api',
  'auth',
  'chat',
  'crm',
  'storage',
  'notifications',
  'consents',
  'routing',
  'middleware',
  'providers',
  'repositories',
  'services',
  'controllers',
  'validation',
  'types',
  'utils',
  'logs',
  'tests',
  'docs'
];

for (const directory of requiredDirectories) {
  await access(join(backendRoot, directory));
}

console.log(`structure-check: ${requiredDirectories.length} directories present`);
