// DEV-ONLY TOOL — never run this in production or on a public server.
// Saves base64 PNG data from the icon-generator to the store-assets folder.
const http = require('http');
const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\sebas\\Desktop\\RhombusChess\\store-assets';
const ALLOWED_ORIGIN = 'http://localhost:3003';

// Allowed filename pattern: alphanumeric, hyphens, underscores only (no path traversal)
const SAFE_NAME = /^[a-zA-Z0-9_-]+$/;

http.createServer((req, res) => {
  // Restrict to localhost requests only
  const origin = req.headers['origin'] || '';
  const host = req.headers['host'] || '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    res.writeHead(403);
    res.end('Forbidden: localhost only');
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let b = '';
    req.on('data', d => b += d);
    req.on('end', () => {
      try {
        const { name, data } = JSON.parse(b);

        // Validate filename — no path traversal, no special chars
        if (!name || !SAFE_NAME.test(name)) {
          res.writeHead(400);
          res.end('Invalid filename');
          return;
        }

        // Resolve and verify path stays within the intended directory
        const fp = path.resolve(dir, name + '.png');
        if (!fp.startsWith(path.resolve(dir))) {
          res.writeHead(400);
          res.end('Path traversal rejected');
          return;
        }

        // Validate it's actually a PNG (must start with PNG data URI)
        if (!data || !data.startsWith('data:image/png;base64,')) {
          res.writeHead(400);
          res.end('Only PNG images accepted');
          return;
        }

        const buf = Buffer.from(data.replace(/^data:image\/png;base64,/, ''), 'base64');
        fs.writeFileSync(fp, buf);
        console.log('Saved: ' + fp + ' (' + buf.length + ' bytes)');
        res.writeHead(200);
        res.end('OK');
      } catch (e) {
        console.error(e);
        res.writeHead(500);
        res.end('Server error');
      }
    });
    return;
  }
  res.writeHead(200);
  res.end('Save server running (localhost only)');
}).listen(3005, '127.0.0.1', () => console.log('Save server on 127.0.0.1:3005 (localhost only)'));
