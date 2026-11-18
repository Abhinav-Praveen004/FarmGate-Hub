/**
 * Unified Production & Gateway Server for FarmGate Hub
 * 
 * Serves / Proxies:
 *  - Port 8080: Unified Gateway Portal (Launcher, and reverse proxy for all paths)
 *  - Port 4000: Investor Pitch Site (if not already running)
 *  - Port 5173: Frontend Web App (if not already running)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function serveStatic(dir, spaFallback = false) {
  return (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    let filePath = path.join(dir, pathname === '/' ? 'index.html' : pathname);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    if (spaFallback) {
      const indexPath = path.join(dir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexPath).pipe(res);
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  };
}

function proxyRequest(req, res, targetPort) {
  const proxyReq = http.request(
    `http://localhost:${targetPort}${req.url}`,
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
    res.end(`<h3>Service on port ${targetPort} is currently connecting... (${err.message})</h3><p><a href="/">Return to Gateway</a></p>`);
  });
  req.pipe(proxyReq);
}

function listenSafe(server, port, label, callback) {
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  ℹ [${label}] Port ${port} is already active.`);
    } else {
      console.error(`  [${label}] Error:`, err);
    }
  });
  server.listen(port, () => {
    if (callback) callback();
  });
}

async function startUnifiedServer() {
  console.log('================================================================');
  console.log('  FarmGate Hub Unified Gateway Starting...');
  console.log('================================================================');

  const siteDist = path.join(__dirname, 'apps', 'site', 'dist');
  const webDist = path.join(__dirname, 'apps', 'web', 'dist');

  const siteDir = fs.existsSync(siteDist) ? siteDist : path.join(__dirname, 'apps', 'site');
  const webDir = fs.existsSync(webDist) ? webDist : path.join(__dirname, 'apps', 'web');

  // 1. Standalone Pitch Site Server on Port 4000 (safe bind)
  const siteHandler = serveStatic(siteDir, false);
  const siteServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    siteHandler(req, res);
  });
  listenSafe(siteServer, 4000, 'Pitch Site', () => {
    console.log('  ✓ [Pitch Site]      http://localhost:4000');
  });

  // 2. Standalone Web App Server on Port 5173 (safe bind)
  const webHandler = serveStatic(webDir, true);
  const webServer = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url.startsWith('/api')) {
      proxyRequest(req, res, 8787);
      return;
    }
    webHandler(req, res);
  });
  listenSafe(webServer, 5173, 'Web App', () => {
    console.log('  ✓ [Web App]         http://localhost:5173');
  });

  // 3. Unified Gateway Portal on Port 8080 (Primary Launcher & Reverse Proxy)
  const gatewayServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Root launcher HTML page
    if (req.url === '/' || req.url === '/index.html') {
      const html = `<!DOCTYPE html>
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
    <span class="badge">PROTOTYPE READY • PORT 8080 GATEWAY</span>
    <h1>FarmGate Hub Launcher</h1>
    <p>All micro-hub services, mobile interfaces, and simulated hardware adapters are running in this unified instance.</p>
    
    <div class="grid">
      <a class="card" href="http://localhost:4000" target="_blank">
        <span class="badge" style="background: #2563eb;">PORT 4000</span>
        <div class="title">Investor Pitch Site →</div>
        <div class="desc">Public pitch page with anti-slop copy, interactive leak simulator, and seed ask.</div>
        <span class="port-link">http://localhost:4000</span>
      </a>
      <a class="card" href="http://localhost:5173/farmer" target="_blank">
        <span class="badge">P0 • PORT 5173</span>
        <div class="title">Mobile Farmer App →</div>
        <div class="desc">Screens 1-4 (Today's Price, Lots, Rupee Waterfall, Money) + WhatsApp drawer.</div>
        <span class="port-link">http://localhost:5173/farmer</span>
      </a>
      <a class="card" href="http://localhost:5173/hub" target="_blank">
        <span class="badge">P0 • PORT 5173</span>
        <div class="title">Hub Operator Console →</div>
        <div class="desc">Digital scale capture, 10-Tonne Cool Pod telemetry, collective load builder, payouts.</div>
        <span class="port-link">http://localhost:5173/hub</span>
      </a>
      <a class="card" href="http://localhost:5173/impact" target="_blank">
        <span class="badge">P0 • PORT 5173</span>
        <div class="title">Impact & Investor Dashboard →</div>
        <div class="desc">5 core KPIs, per-tonne economics (+27.2%), 4-year cohort model, sensitivity sliders.</div>
        <span class="port-link">http://localhost:5173/impact</span>
      </a>
      <a class="card" href="http://localhost:5173/buyer" target="_blank">
        <span class="badge" style="background: #d97706;">P1 • PORT 5173</span>
        <div class="title">Buyer Wholesale Portal →</div>
        <div class="desc">Graded wholesale catalog, 100% escrow lock, live cold-chain dispatch tracking.</div>
        <span class="port-link">http://localhost:5173/buyer</span>
      </a>
      <a class="card" href="http://localhost:5173/t/LOT-214" target="_blank">
        <span class="badge" style="background: #059669;">P1 • PORT 5173</span>
        <div class="title">Public Traceability Certificate →</div>
        <div class="desc">Provenance audit trail, farmer 45% fair share proof, 73% lower waste guarantee.</div>
        <span class="port-link">http://localhost:5173/t/LOT-214</span>
      </a>
      <a class="card" href="http://localhost:5173/channels" target="_blank">
        <span class="badge" style="background: #475569;">P1 • PORT 5173</span>
        <div class="title">Channels Simulator (WhatsApp / IVR) →</div>
        <div class="desc">Interactive 2-way WhatsApp Business bot and toll-free voice keypad with Web Speech.</div>
        <span class="port-link">http://localhost:5173/channels</span>
      </a>
      <a class="card" href="http://localhost:8787" target="_blank">
        <span class="badge" style="background: #7c3aed;">API • PORT 8787</span>
        <div class="title">Hono API & SSE Explorer →</div>
        <div class="desc">REST endpoints, SQLite Drizzle schema, and Server-Sent Events stream.</div>
        <span class="port-link">http://localhost:8787</span>
      </a>
    </div>

    <div class="footer">
      FarmGate Hub Prototype • Group 4 Student Report &quot;Improving Farmers' Income&quot; • Section 4 Reconciled Engine
    </div>
  </div>
</body>
</html>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Proxy API calls directly to port 8787
    if (req.url.startsWith('/api') || req.url.startsWith('/health')) {
      proxyRequest(req, res, 8787);
      return;
    }

    // Proxy pitch site calls if requested under /site
    if (req.url.startsWith('/site')) {
      req.url = req.url.replace(/^\/site/, '') || '/';
      proxyRequest(req, res, 4000);
      return;
    }

    // All other paths (/farmer, /hub, /impact, /buyer, /channels, /sources, /t/*, /styleguide, assets) proxy to web app
    proxyRequest(req, res, 5173);
  });

  listenSafe(gatewayServer, 8080, 'Gateway Portal', () => {
    console.log('  ✓ [Gateway Portal]  http://localhost:8080');
    console.log('================================================================');
    console.log('  All services connected and ready!');
    console.log('================================================================\n');
  });
}

startUnifiedServer();
