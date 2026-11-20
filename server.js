'use strict';
// Tiny static file server for local use. No dependencies, no logging of content.
// The page itself makes no network requests; this only hands out the files.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8109;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};
// Files that are served. Everything else (tests, bench, git data) stays private.
const PUBLIC = /^\/(?:index\.html|styles\.css|src\/[\w-]+\.js|docs\/[\w.-]+\.png)?$/;

function handler(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (e) { res.writeHead(400); return res.end('Bad request'); }
  if (!PUBLIC.test(pathname)) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
  const file = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    });
    res.end(data);
  });
}

function start(port = PORT) {
  const server = http.createServer(handler);
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (require.main === module) {
  start().then((s) => console.log('Paste Guard on http://127.0.0.1:' + s.address().port + '/  (Ctrl+C to stop)'));
}
module.exports = { start };
