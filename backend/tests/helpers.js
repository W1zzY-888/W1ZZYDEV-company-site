import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

export const backendRoot = resolve(new URL('..', import.meta.url).pathname);

export async function listFiles(directory = backendRoot) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    if (entry === 'node_modules') continue;
    const pathname = join(directory, entry);
    const info = await stat(pathname);
    if (info.isDirectory()) files.push(...await listFiles(pathname));
    else files.push(pathname);
  }
  return files;
}

export async function jsFiles() {
  return (await listFiles()).filter(file => file.endsWith('.js'));
}

export async function readText(file) {
  return readFile(file, 'utf8');
}

export function rel(file) {
  return relative(backendRoot, file);
}
