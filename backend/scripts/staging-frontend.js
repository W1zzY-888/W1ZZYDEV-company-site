import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { assertNotProduction } from './staging-utils.js';

assertNotProduction();

const root = normalize(new URL('../..', import.meta.url).pathname);
const port = Number(process.env.STAGING_FRONTEND_PORT || 8080);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url || '/', `http://127.0.0.1:${port}`).pathname;
  const candidate = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
  if (!candidate.startsWith(root) || !existsSync(candidate)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(candidate)] || 'application/octet-stream' });
  createReadStream(candidate).pipe(res);
});

server.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ message: 'staging.frontend.started', host: '127.0.0.1', port })));
