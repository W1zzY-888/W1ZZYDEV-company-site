import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export class DockerPsqlClient {
  constructor({ database }) {
    this.database = database;
  }

  async query(sql, params = []) {
    const trimmed = sql.trim();
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(trimmed)) return { rows: [], rowCount: 0 };
    const executable = toJsonQuery(substituteParams(trimmed, params));
    const { stdout } = await execFileAsync('docker', ['compose', '-f', 'docker-compose.staging.yml', 'exec', '-T', 'postgres', 'psql', '-U', 'w1zzydev_staging', '-d', this.database, '-v', 'ON_ERROR_STOP=1', '-X', '-q', '-t', '-A', '-c', executable], {
      cwd: new URL('..', import.meta.url).pathname,
      maxBuffer: 1024 * 1024
    });
    const text = stdout.trim() || '[]';
    const rows = JSON.parse(text);
    return { rows, rowCount: rows.length };
  }
}

function substituteParams(sql, params) {
  return params
    .map((param, index) => [index + 1, param])
    .sort((a, b) => b[0] - a[0])
    .reduce((current, [index, param]) => current.replaceAll(`$${index}`, literal(param)), sql)
    .replace(/;+\s*$/, '');
}

function literal(value) {
  if (value == null) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function toJsonQuery(sql) {
  const normalized = sql.trim();
  const withReturning = normalized.startsWith('DELETE FROM') && !/\bRETURNING\b/i.test(normalized)
    ? `${normalized} RETURNING 1 AS deleted`
    : normalized;
  return `WITH q AS (${withReturning}) SELECT COALESCE(json_agg(q), '[]'::json) FROM q`;
}
