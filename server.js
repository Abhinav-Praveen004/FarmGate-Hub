/**
 * Unified Production & Gateway Server for FarmGate Hub
 * 
 * Supports:
 *  - Primary Server (process.env.PORT || 8080):
 *      / -> Investor Pitch Site (apps/site/dist)
 *      /farmer, /hub, /buyer, /impact, /channels, /styleguide, /t/* -> FarmGate Web App (apps/web/dist)
 *      /launcher -> Unified System Launcher
 *      /api/*, /health -> Hono API Backend (port 8787)
 *  - Standalone Dev fallbacks on port 4000 and 5173 (if free)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

function proxyRequest(req, res, targetPort) {
  const proxyReq = http.request(
    `http://127.0.0.1:${targetPort}${req.url}`,
    {
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h3>API service is initializing... (${err.message})</h3><p>Please refresh in 2 seconds or <a href="/">return to home</a>.</p>`);
  });
  req.pipe(proxyReq);
}

function ensureApiProcess() {
  const checkReq = http.get('http://127.0.0.1:8787/health', (res) => {
    if (res.statusCode === 200) {
      console.log('  ✓ [API Backend]     Active on http://127.0.0.1:8787');
    }
  });

  checkReq.on('error', () => {
    console.log('  ⚡ [API Backend]     Starting on port 8787 via tsx...');
    const isWindows = process.platform === 'win32';
    const npxCmd = isWindows ? 'npx.cmd' : 'npx';
    const apiProc = spawn(npxCmd, ['tsx', 'apps/api/src/index.ts'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, PORT: '8787', API_PORT: '8787' },
    });

    apiProc.on('error', (err) => {
      console.error('Failed to spawn API server:', err);
    });

    process.on('exit', () => apiProc.kill());
  });
}

function renderLauncherHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FarmGate Hub • Unified Launch Gateway</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f8f8; color: #0a0a0a; margin: 0; padding: 40px 20px; }
    .container { max-width: 860px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { font-family: serif; font-size: 28px; margin-top: 0; margin-bottom: 4px; color: #1f6b3a; }
    p { color: #555; line-height: 1.6; margin-top: 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .card { padding: 18px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; text-decoration: none; color: inherit; transition: all 0.15s; }
    .card:hover { border-color: #1f6b3a; background: #f0f7f2; }
    .badge { display: inline-block; font-size: 10px; font-weight: bold; background: #1f6b3a; color: white; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px; }
    .title { font-weight: bold; font-size: 15px; margin-bottom: 4px; color: #0a0a0a; }
    .desc { font-size: 12px; color: #666; }
    .port-link { font-family: monospace; font-size: 11px; color: #1f6b3a; font-weight: bold; margin-top: 6px; display: block; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">PROTOTYPE READY • UNIFIED GATEWAY</span>
    <h1>FarmGate Hub Launcher</h1>
    <p>All micro-hub surfaces, mobile interfaces, and simulated hardware adapters are accessible from this deployment.</p>
    
    <div class="grid">
      <a class="card" href="/">
        <span class="badge" style="background: #2563eb;">PITCH SITE</span>
        <div class="title">Investor Pitch Site →</div>
        <div class="desc">Public pitch page with anti-slop copy, interactive leak simulator, and seed ask.</div>
        <span class="port-link">/ (Homepage)</span>
      </a>
      <a class="card" href="/farmer">
        <span class="badge">MOBILE APP</span>
        <div class="title">Mobile Farmer App →</div>
        <div class="desc">Screens 1-4 (Today's Price, Lots, Rupee Waterfall, Money) + WhatsApp drawer.</div>
        <span class="port-link">/farmer</span>
      </a>
      <a class="card" href="/hub">
        <span class="badge">OPERATOR</span>
        <div class="title">Hub Operator Console →</div>
        <div class="desc">Digital scale capture, 10-Tonne Cool Pod telemetry, collective load builder, payouts.</div>
        <span class="port-link">/hub</span>
      </a>
      <a class="card" href="/impact">
        <span class="badge">INVESTOR</span>
        <div class="title">Impact & Investor Dashboard →</div>
        <div class="desc">5 core KPIs, per-tonne economics (+27.2%), 4-year cohort model, sensitivity sliders.</div>
        <span class="port-link">/impact</span>
      </a>
      <a class="card" href="/buyer">
        <span class="badge" style="background: #d97706;">BUYER PORTAL</span>
        <div class="title">Buyer Wholesale Portal →</div>
        <div class="desc">Graded wholesale catalog, 100% escrow lock, live cold-chain dispatch tracking.</div>
        <span class="port-link">/buyer</span>
      </a>
      <a class="card" href="/t/FGH-ANNUR-2026-LOT214">
        <span class="badge" style="background: #059669;">QR CERTIFICATE</span>
        <div class="title">Public Traceability Certificate →</div>
        <div class="desc">Provenance audit trail, farmer 45% fair share proof, 73% lower waste guarantee.</div>
        <span class="port-link">/t/FGH-ANNUR-2026-LOT214</span>
      </a>
      <a class="card" href="/channels">
        <span class="badge" style="background: #475569;">CHANNELS</span>
        <div class="title">Channels Simulator (WhatsApp / IVR) →</div>
        <div class="desc">Interactive 2-way WhatsApp Business bot and toll-free voice keypad with Web Speech.</div>
        <span class="port-link">/channels</span>
      </a>
      <a class="card" href="/api/prices/today">
        <span class="badge" style="background: #7c3aed;">API ENGINE</span>
        <div class="title">Live Backend API →</div>
        <div class="desc">REST endpoints, SQLite Drizzle schema, and neural voice stream.</div>
        <span class="port-link">/api/prices/today</span>
      </a>
    </div>

    <div class="footer">
      FarmGate Hub Prototype • Group 4 Student Report &quot;Improving Farmers' Income&quot; • Section 4 Reconciled Engine
    </div>
  </div>
</body>
</html>`;
}

function listenSafe(server, port, label, callback) {
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  ℹ [${label}] Port ${port} is already active.`);
    } else {
      console.error(`  [${label}] Error:`, err);
    }
  });
  server.listen(port, '0.0.0.0', () => {
    if (callback) callback();
  });
}

async function startUnifiedServer() {
  console.log('================================================================');
  console.log('  FarmGate Hub Unified Server Starting...');
  console.log('================================================================');

  const siteDist = path.join(__dirname, 'apps', 'site', 'dist');
  const webDist = path.join(__dirname, 'apps', 'web', 'dist');

  const siteIndex = path.join(siteDist, 'index.html');
  const webIndex = path.join(webDist, 'index.html');

  // 1. Ensure API backend is running
  ensureApiProcess();

  // 2. Primary Unified Server (Listens on process.env.PORT or 8080)
  const primaryPort = Number(process.env.PORT) || 8080;

  const primaryServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // API & Health checks -> Proxy to Hono API (port 8787)
    if (pathname.startsWith('/api') || pathname.startsWith('/health')) {
      proxyRequest(req, res, 8787);
      return;
    }

    // Launcher directory page
    if (pathname === '/launcher' || pathname === '/launcher.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderLauncherHtml());
      return;
    }

    // Web App SPA routes: /farmer, /hub, /buyer, /impact, /channels, /styleguide, /t/*
    const webAppRoutes = ['/farmer', '/hub', '/buyer', '/impact', '/channels', '/styleguide', '/t/'];
    if (webAppRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
      if (fs.existsSync(webIndex)) {
        sendFile(res, webIndex);
        return;
      }
    }

    // Check assets in web dist first (/assets/...)
    if (pathname.startsWith('/assets/')) {
      const webAssetPath = path.join(webDist, pathname);
      if (fs.existsSync(webAssetPath) && fs.statSync(webAssetPath).isFile()) {
        sendFile(res, webAssetPath);
        return;
      }
      const siteAssetPath = path.join(siteDist, pathname);
      if (fs.existsSync(siteAssetPath) && fs.statSync(siteAssetPath).isFile()) {
        sendFile(res, siteAssetPath);
        return;
      }
    }

    // Check static files in apps/site/dist (e.g. /, /style.css, /app.js, images)
    const siteFilePath = path.join(siteDist, pathname === '/' ? 'index.html' : pathname);
    if (fs.existsSync(siteFilePath) && fs.statSync(siteFilePath).isFile()) {
      sendFile(res, siteFilePath);
      return;
    }

    // Check static files in apps/web/dist
    const webFilePath = path.join(webDist, pathname);
    if (fs.existsSync(webFilePath) && fs.statSync(webFilePath).isFile()) {
      sendFile(res, webFilePath);
      return;
    }

    // Default root -> Pitch site
    if (pathname === '/' || pathname === '/index.html') {
      if (fs.existsSync(siteIndex)) {
        sendFile(res, siteIndex);
        return;
      }
    }

    // SPA fallback for any deep web route
    if (fs.existsSync(webIndex)) {
      sendFile(res, webIndex);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  });

  listenSafe(primaryServer, primaryPort, 'Unified Gateway', () => {
    console.log(`  ✓ [Unified Gateway] http://localhost:${primaryPort}`);
    console.log(`    ├── Homepage / Pitch Site:  http://localhost:${primaryPort}/`);
    console.log(`    ├── Farmer Mobile App:      http://localhost:${primaryPort}/farmer`);
    console.log(`    ├── Hub Operator Console:   http://localhost:${primaryPort}/hub`);
    console.log(`    ├── Buyer Wholesale Portal: http://localhost:${primaryPort}/buyer`);
    console.log(`    ├── QR Traceability Cert:   http://localhost:${primaryPort}/t/FGH-ANNUR-2026-LOT214`);
    console.log(`    └── System Launcher:        http://localhost:${primaryPort}/launcher`);
    console.log('================================================================\n');
  });

  // 3. In non-production local environments, safely bind ports 4000 and 5173 if not active
  if (process.env.NODE_ENV !== 'production' && primaryPort !== 4000 && primaryPort !== 5173) {
    const siteServer = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const filePath = path.join(siteDist, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        sendFile(res, filePath);
      } else if (fs.existsSync(siteIndex)) {
        sendFile(res, siteIndex);
      } else {
        res.writeHead(404).end('Not Found');
      }
    });
    listenSafe(siteServer, 4000, 'Pitch Site Standalone');

    const webServer = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      if (parsedUrl.pathname.startsWith('/api') || parsedUrl.pathname.startsWith('/health')) {
        proxyRequest(req, res, 8787);
        return;
      }
      const filePath = path.join(webDist, parsedUrl.pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        sendFile(res, filePath);
      } else if (fs.existsSync(webIndex)) {
        sendFile(res, webIndex);
      } else {
        res.writeHead(404).end('Not Found');
      }
    });
    listenSafe(webServer, 5173, 'Web App Standalone');
  }
}

startUnifiedServer();
