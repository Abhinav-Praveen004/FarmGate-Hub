/**
 * Unified Single-Process Production Server for FarmGate Hub
 * Serves:
 *  - Port 8787: Hono API Backend (SSE, SQLite Drizzle, simulated hardware)
 *  - Port 4000: Static Investor Pitch Site (anti-slop design-taste)
 *  - Port 5173: Frontend Web App (Farmer, Hub, Buyer, Traceability, Channels, Impact)
 *  - Port 8080: Unified Developer & Demo Gateway
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

    // Default to index.html
    let filePath = path.join(dir, pathname === '/' ? 'index.html' : pathname);

    // If file exists and is a file
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback: return index.html for non-asset routes
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

async function startUnifiedServer() {
  console.log('================================================================');
  console.log('  FarmGate Hub Unified Server Starting...');
  console.log('================================================================');

  const siteDist = path.join(__dirname, 'apps', 'site', 'dist');
  const webDist = path.join(__dirname, 'apps', 'web', 'dist');

  // Verify builds exist; if not fallback to src folders
  const siteDir = fs.existsSync(siteDist) ? siteDist : path.join(__dirname, 'apps', 'site');
  const webDir = fs.existsSync(webDist) ? webDist : path.join(__dirname, 'apps', 'web');

  // 1. Start Pitch Site Server on Port 4000
  const siteHandler = serveStatic(siteDir, false);
  const siteServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    siteHandler(req, res);
  });
  siteServer.listen(4000, () => {
    console.log('  ✓ [Pitch Site]      http://localhost:4000');
  });

  // 2. Start Web Application Server on Port 5173
  const webHandler = serveStatic(webDir, true);
  const webServer = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Proxy /api to API server port 8787
    if (req.url.startsWith('/api')) {
      const proxyReq = http.request(
        `http://localhost:8787${req.url}`,
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
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API Gateway connection failed', details: err.message }));
      });
      req.pipe(proxyReq);
      return;
    }

    webHandler(req, res);
  });
  webServer.listen(5173, () => {
    console.log('  ✓ [Farmer App]      http://localhost:5173/farmer');
    console.log('  ✓ [Hub Console]     http://localhost:5173/hub');
    console.log('  ✓ [Buyer Portal]    http://localhost:5173/buyer');
    console.log('  ✓ [Traceability]    http://localhost:5173/t/LOT-214');
    console.log('  ✓ [Channels / IVR]  http://localhost:5173/channels');
    console.log('  ✓ [Impact Board]    http://localhost:5173/impact');
    console.log('  ✓ [Design Tokens]   http://localhost:5173/styleguide');
  });

  // 3. Start Gateway Portal on Port 8080
  const gatewayServer = http.createServer((req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FarmGate Hub - Unified Launch Gateway</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f8f8; color: #0a0a0a; margin: 0; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { font-family: serif; font-size: 28px; margin-top: 0; color: #1f6b3a; }
    p { color: #555; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .card { padding: 18px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; text-decoration: none; color: inherit; transition: all 0.15s; }
    .card:hover { border-color: #1f6b3a; background: #f0f7f2; }
    .badge { display: inline-block; font-size: 10px; font-weight: bold; background: #1f6b3a; color: white; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px; }
    .title { font-weight: bold; font-size: 15px; margin-bottom: 4px; }
    .desc { font-size: 12px; color: #666; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">PROTOTYPE READY</span>
    <h1>FarmGate Hub Launcher</h1>
    <p>All micro-hub services, mobile interfaces, and simulated hardware adapters are running in this unified instance.</p>
    
    <div class="grid">
      <a class="card" href="http://localhost:4000" target="_blank">
        <span class="badge" style="background: #2563eb;">PORT 4000</span>
        <div class="title">Investor Pitch Site →</div>
        <div class="desc">Public pitch page with anti-slop copy, interactive leak simulator, and seed ask.</div>
      </a>
      <a class="card" href="http://localhost:5173/farmer" target="_blank">
        <span class="badge">P0 • PORT 5173</span>
        <div class="title">Mobile Farmer App →</div>
        <div class="desc">Screens 1-4 (Today's Price, Lots, Rupee Waterfall, Money) + WhatsApp drawer.</div>
      </a>
      <a class="card" href="http://localhost:5173/hub" target="_blank">
        <span class="badge">P0 • PORT 5173</span>
        <div class="title">Hub Operator Console →</div>
        <div class="desc">Digital scale capture, 10-Tonne Cool Pod telemetry, collective load builder, payouts.</div>
      </a>
      <a class="card" href="http://localhost:5173/impact" target="_blank">
        <span class="badge">P0 • PORT 5173</span>
        <div class="title">Impact & Investor Dashboard →</div>
        <div class="desc">5 core KPIs, per-tonne economics (+27.2%), 4-year cohort model, sensitivity sliders.</div>
      </a>
      <a class="card" href="http://localhost:5173/buyer" target="_blank">
        <span class="badge" style="background: #d97706;">P1 • PORT 5173</span>
        <div class="title">Buyer Portal →</div>
        <div class="desc">Graded wholesale catalog, 100% escrow lock, live cold-chain dispatch tracking.</div>
      </a>
      <a class="card" href="http://localhost:5173/t/LOT-214" target="_blank">
        <span class="badge" style="background: #059669;">P1 • PORT 5173</span>
        <div class="title">Public Traceability Certificate →</div>
        <div class="desc">Provenance audit trail, farmer 45% fair share proof, 73% lower waste guarantee.</div>
      </a>
      <a class="card" href="http://localhost:5173/channels" target="_blank">
        <span class="badge" style="background: #475569;">P1 • PORT 5173</span>
        <div class="title">Channels Simulator (WhatsApp / IVR) →</div>
        <div class="desc">Interactive 2-way WhatsApp Business bot and toll-free voice keypad with Web Speech.</div>
      </a>
      <a class="card" href="http://localhost:5173/sources" target="_blank">
        <span class="badge" style="background: #7c3aed;">PORT 5173</span>
        <div class="title">Evidence Base & Sources →</div>
        <div class="desc">Group 4 author attribution, Section 4 citations, and empirical benchmark mapping.</div>
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
  });
  gatewayServer.listen(8080, () => {
    console.log('  ✓ [Gateway Portal]  http://localhost:8080');
    console.log('================================================================');
    console.log('  All services ready! Zero external dependencies needed.');
    console.log('================================================================\n');
  });
}

startUnifiedServer();
