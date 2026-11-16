/**
 * Tiny static server for the production build (dist/), for honest network tests: it gzips text responses the way
 * Vercel does (vite preview does not), serves each prerendered page from its own folder, and falls back to the SPA shell.
 *
 *   node scripts/showcase/serve-dist.mjs [port]      default 4392
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
const PORT = Number(process.argv[2] ?? 4392);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.txt']);

const resolveFile = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/\.\.+/g, '');
  const direct = path.join(ROOT, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(direct, 'index.html');
  if (fs.existsSync(index)) return index;
  if (!path.extname(clean)) {
    const shell = path.join(ROOT, 'app-shell.html');
    return fs.existsSync(shell) ? shell : path.join(ROOT, 'index.html');
  }
  return null;
};

http
  .createServer((req, res) => {
    const file = resolveFile(req.url ?? '/');
    if (!file) {
      res.writeHead(404).end('not found');
      return;
    }
    const ext = path.extname(file);
    const body = fs.readFileSync(file);
    const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-store' };
    if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
      const zipped = zlib.gzipSync(body, { level: 6 });
      res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': zipped.length });
      res.end(zipped);
    } else {
      res.writeHead(200, { ...headers, 'Content-Length': body.length });
      res.end(body);
    }
  })
  .listen(PORT, () => console.log(`serving dist on http://localhost:${PORT}`));
