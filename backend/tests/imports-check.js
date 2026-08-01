import { existsSync } from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';
import { jsFiles, readText, rel } from './helpers.js';

const importPattern = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]|export\s+[^'"]*\s+from\s+['"]([^'"]+)['"]/g;
const graph = new Map();
const files = await jsFiles();
const fileSet = new Set(files.map(file => normalize(file)));

for (const file of files) {
  const text = await readText(file);
  const dependencies = [];
  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1] || match[2];
    if (!specifier.startsWith('.')) continue;
    const target = normalize(resolve(dirname(file), specifier));
    const withJs = target.endsWith('.js') ? target : `${target}.js`;
    const withIndex = join(target, 'index.js');
    const resolved = existsSync(withJs) ? withJs : existsSync(withIndex) ? withIndex : '';
    if (!resolved) throw new Error(`Missing import target in ${rel(file)}: ${specifier}`);
    dependencies.push(normalize(resolved));
  }
  graph.set(normalize(file), dependencies);
}

const visiting = new Set();
const visited = new Set();
const stack = [];

function visit(file) {
  if (visiting.has(file)) {
    const cycle = [...stack.slice(stack.indexOf(file)), file].map(rel).join(' -> ');
    throw new Error(`Circular dependency detected: ${cycle}`);
  }
  if (visited.has(file) || !fileSet.has(file)) return;
  visiting.add(file);
  stack.push(file);
  for (const dependency of graph.get(file) || []) visit(dependency);
  stack.pop();
  visiting.delete(file);
  visited.add(file);
}

for (const file of files) visit(normalize(file));

console.log('imports-check: ok');
