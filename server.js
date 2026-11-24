// Scrib: tiny zero-dependency server. Serves the app from /public and, for live
// mode, relays messages between everyone in a room over Server-Sent Events.
//   GET  /live/ping                                   -> { ok, max }
//   GET  /live/events?room=&id=&name=                 -> event stream (peers + messages)
//   POST /live/send?room=&id=      body: JSON message -> relayed to the rest of the room
//   GET  /live/lobby                                  -> event stream: everyone live on Scrib right now
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const root = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3000;
const MAX_PEERS = 10;
const MAX_BODY = 2 * 1024 * 1024;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// ---------------------------------------------------------------------------
// Live rooms
// ---------------------------------------------------------------------------
const rooms = new Map(); // room -> Map(id -> { res, name, since })
const lobby = new Set(); // open /live/lobby streams
const MAX_LOBBY = 500;
const validId = s => typeof s === 'string' && /^[a-z0-9-]{4,40}$/i.test(s);
const cleanName = s => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24) || 'Guest';

function write(res, data) { try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch { /* socket gone */ } }
function peersOf(room) {
  const r = rooms.get(room);
  return r ? [...r].map(([id, p]) => ({ id, name: p.name, since: p.since })) : [];
}
function everyone() {
  const users = [];
  for (const [room, r] of rooms) for (const [id, p] of r) users.push({ id, name: p.name, room, since: p.since });
  return users;
}
function announceLobby() {
  const msg = { t: 'lobby', users: everyone() };
  for (const res of lobby) write(res, msg);
}
function announce(room) {
  const r = rooms.get(room);
  if (r) { const msg = { t: 'peers', peers: peersOf(room) }; for (const p of r.values()) write(p.res, msg); }
  announceLobby();
}
function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function live(req, res, url) {
  const room = url.searchParams.get('room'), id = url.searchParams.get('id');
  if (url.pathname === '/live/ping') return json(res, 200, { ok: true, max: MAX_PEERS });
  if (url.pathname === '/live/lobby' && req.method === 'GET') {
    if (lobby.size >= MAX_LOBBY) return json(res, 503, { error: 'busy' });
    res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write('retry: 2000\n\n');
    lobby.add(res);
    write(res, { t: 'lobby', users: everyone() });
    const beat = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 15000);
    req.on('close', () => { clearInterval(beat); lobby.delete(res); });
    return;
  }
  if (!validId(room) || !validId(id)) return json(res, 400, { error: 'bad room or id' });

  if (url.pathname === '/live/events' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write('retry: 1500\n\n');
    let r = rooms.get(room);
    if (!r) rooms.set(room, (r = new Map()));
    const old = r.get(id);
    if (old) { try { old.res.end(); } catch {} r.delete(id); } // same tab reconnecting
    if (r.size >= MAX_PEERS) { res.write(`event: full\ndata: {}\n\n`); return res.end(); }
    const since = Number(url.searchParams.get('since')) || Date.now();
    r.set(id, { res, name: cleanName(url.searchParams.get('name')), since });
    announce(room);
    const beat = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 15000);
    req.on('close', () => {
      clearInterval(beat);
      const cur = rooms.get(room);
      if (cur && cur.get(id) && cur.get(id).res === res) { cur.delete(id); if (!cur.size) rooms.delete(room); announce(room); }
    });
    return;
  }

  if (url.pathname === '/live/send' && req.method === 'POST') {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { req.destroy(); return; } chunks.push(c); });
    req.on('end', () => {
      const r = rooms.get(room);
      if (!r || !r.has(id)) return json(res, 409, { error: 'not in room' });
      let msg;
      try { msg = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return json(res, 400, { error: 'bad json' }); }
      if (!msg || typeof msg !== 'object') return json(res, 400, { error: 'bad message' });
      if (msg.t === 'name') { r.get(id).name = cleanName(msg.name); announce(room); return json(res, 200, { ok: true }); }
      const out = { t: 'msg', from: id, msg };
      for (const [pid, p] of r) if (pid !== id && (!msg.to || msg.to === pid)) write(p.res, out);
      json(res, 200, { ok: true });
    });
    return;
  }
  json(res, 404, { error: 'not found' });
}

// ---------------------------------------------------------------------------
// Static files
// ---------------------------------------------------------------------------
http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/live/')) return live(req, res, url);
    let p = decodeURIComponent(url.pathname);
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
      const compressible = /^(text\/|image\/svg|application\/(json|manifest|xml))/.test(headers['Content-Type']);
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
    console.log(`Scrib running at http://localhost:${PORT}`);
  });
