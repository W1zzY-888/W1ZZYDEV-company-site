import { spawnSync } from 'node:child_process';
import { jsFiles, rel } from './helpers.js';

for (const file of await jsFiles()) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`Syntax check failed: ${rel(file)}`);
  }
}

console.log('syntax-check: ok');
