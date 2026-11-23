// Tiny zero-dependency static server for the Sketch → UI app.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const root = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3000;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (p === '/') p = '/index.html';
    const file = path.join(root, path.normalize(p));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not found');
      }
      // Revalidate every time (no stale app files), but allow 304s and the back/forward cache.
      const etag = '"' + crypto.createHash('sha1').update(data).digest('base64').slice(0, 16) + '"';
      const headers = {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        ETag: etag,
        Vary: 'Accept-Encoding',
      };
      if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
      const compressible = /^(text\/|image\/svg)/.test(headers['Content-Type']);
      const acceptsGzip = (req.headers['accept-encoding'] || '').split(',').some(e => e.trim().startsWith('gzip'));
      if (compressible && acceptsGzip) {
        headers['Content-Encoding'] = 'gzip';
        res.writeHead(200, headers);
        return res.end(zlib.gzipSync(data));
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  })
  .listen(PORT, 'localhost', () => {
    console.log(`Sketch → UI running at http://localhost:${PORT}`);
  });
