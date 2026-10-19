#!/usr/bin/env node
/**
 * Static e2e host for dist/viewer-app with the same /backend and /middleware
 * proxies as proxy.conf.e2e.json. Avoids webpack-dev-server under Playwright load.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, '..');
const distRoot = join(appRoot, 'dist', 'viewer-app');

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function parsePort(argv) {
  const flag = argv.indexOf('--port');
  if (flag >= 0 && argv[flag + 1]) {
    return Number(argv[flag + 1]);
  }
  const eq = argv.find((arg) => arg.startsWith('--port='));
  if (eq) {
    return Number(eq.slice('--port='.length));
  }
  return Number(process.env.PORT || 4400);
}

function proxyDefs(port) {
  const forwardedHost = `localhost:${port}`;
  return [
    {
      prefix: '/backend',
      target: 'http://localhost:18080',
      headers: {
        'X-Forwarded-Host': forwardedHost,
        'X-Forwarded-Proto': 'http',
        'X-Forwarded-Prefix': '/backend',
      },
    },
    {
      prefix: '/middleware',
      target: 'http://localhost:18082',
      headers: {
        'X-Forwarded-Host': forwardedHost,
        'X-Forwarded-Proto': 'http',
        'X-Forwarded-Prefix': '/middleware',
      },
    },
  ];
}

function fail(message) {
  console.error(`[serve-e2e] ${message}`);
  process.exit(1);
}

function proxyPath(prefix, rawUrl) {
  const inbound = new URL(rawUrl || '/', 'http://localhost');
  // Use the URL-normalized pathname so `/prefix/../other` cannot keep the prefix match.
  const normalized = inbound.pathname;
  if (normalized !== prefix && !normalized.startsWith(`${prefix}/`)) {
    return null;
  }
  let path = normalized.slice(prefix.length) || '/';
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  // Collapse leading slashes so a relative URL constructor cannot treat the path as host.
  path = path.replace(/^\/+/, '/');
  if (path.includes('\\') || path.includes('\0')) {
    return null;
  }
  return path + inbound.search;
}

function proxyRequest(clientReq, clientRes, proxy) {
  const target = new URL(proxy.target);
  const path = proxyPath(proxy.prefix, clientReq.url);
  if (path === null) {
    clientRes.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    clientRes.end('Bad path');
    return;
  }

  const headers = { ...clientReq.headers, ...proxy.headers, host: target.host };
  delete headers.connection;

  // Hostname/port come only from the fixed proxy target allow-list.
  const lib = target.protocol === 'https:' ? https : http;
  const upstream = lib.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      path,
      method: clientReq.method,
      headers,
    },
    (upstreamRes) => {
      clientRes.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(clientRes);
    }
  );
  upstream.on('error', (error) => {
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    clientRes.end(`Bad gateway: ${error.message}`);
  });
  clientReq.pipe(upstream);
}

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const candidate = resolve(root, `.${decoded}`);
  if (!candidate.startsWith(root)) {
    return null;
  }
  return candidate;
}

function sendFile(res, filePath) {
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  const headers = { 'Content-Type': type };
  if (extname(filePath).toLowerCase() === '.html') {
    headers['Cache-Control'] = 'no-store';
  }
  res.writeHead(200, headers);
  createReadStream(filePath).pipe(res);
}

function serveStatic(req, res) {
  const urlPath = req.url || '/';
  let filePath = safeJoin(distRoot, urlPath === '/' ? '/index.html' : urlPath);
  if (!filePath) {
    res.writeHead(400).end('Bad path');
    return;
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }
  // SPA fallback for Angular PathLocationStrategy routes.
  const indexHtml = join(distRoot, 'index.html');
  if (existsSync(indexHtml)) {
    sendFile(res, indexHtml);
    return;
  }
  res.writeHead(404).end('Not found');
}

if (!existsSync(join(distRoot, 'index.html'))) {
  fail(`Missing ${join(distRoot, 'index.html')}. Run: npm run build:e2e`);
}

const port = parsePort(process.argv.slice(2));
if (!Number.isFinite(port) || port <= 0) {
  fail(`Invalid port: ${port}`);
}

const proxies = proxyDefs(port);

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  const proxy = proxies.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)
  );
  if (proxy) {
    proxyRequest(req, res, proxy);
    return;
  }
  serveStatic(req, res);
});

// Bind dual-stack so Playwright's localhost (::1 first on macOS) hits this process.
server.on('error', (error) => {
  fail(`listen failed: ${error.message}`);
});

process.on('uncaughtException', (error) => {
  console.error(`[serve-e2e] uncaughtException: ${error.stack || error}`);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error(`[serve-e2e] unhandledRejection: ${reason}`);
  process.exit(1);
});

server.listen(port, () => {
  console.error(`[serve-e2e] Serving ${distRoot} on http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    console.error(`[serve-e2e] Shutting down (${signal})...`);
    server.close(() => process.exit(0));
  });
}
