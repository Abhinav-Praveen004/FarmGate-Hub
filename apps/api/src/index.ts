import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { authRouter } from './routes/auth.js';
import { pricesRouter } from './routes/prices.js';
import { lotsRouter } from './routes/lots.js';
import { advancesRouter } from './routes/advances.js';
import { hubRouter } from './routes/hub.js';
import { buyerRouter } from './routes/buyer.js';
import { receiptsRouter } from './routes/receipts.js';
import { impactRouter } from './routes/impact.js';
import { channelsRouter } from './routes/channels.js';
import { eventsRouter } from './routes/events.js';
import { demoRouter } from './routes/demo.js';
import { traceabilityRouter } from './routes/traceability.js';

export const app = new Hono();

// Enable CORS for web app (5173) and static pitch site (4000)
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:5173', 'http://127.0.0.1:4000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'FarmGate Hub API', port: 8787 }));

// Root route: interactive directory & status
app.get('/', (c) => {
  const accept = c.req.header('Accept') || '';
  if (accept.includes('application/json')) {
    return c.json({
      status: 'ok',
      service: 'FarmGate Hub API',
      version: '0.1.0',
      port: 8787,
      endpoints: {
        health: '/health',
        prices: '/api/prices/today',
        lots: '/api/lots',
        advances: '/api/advances/pending',
        hubIntake: '/api/hub/intake',
        hubPod: '/api/hub/pod',
        buyerOrders: '/api/hub/orders',
        impactKpis: '/api/impact/kpis',
        impactNetwork: '/api/impact/network',
        traceability: '/t/:code',
        eventsSSE: '/api/events',
      },
      surfaces: {
        launchGateway: 'http://localhost:8080',
        pitchSite: 'http://localhost:4000',
        farmerApp: 'http://localhost:5173/farmer',
        hubConsole: 'http://localhost:5173/hub',
        impactDashboard: 'http://localhost:5173/impact',
        buyerPortal: 'http://localhost:5173/buyer',
        traceability: 'http://localhost:5173/t/LOT-214',
        channels: 'http://localhost:5173/channels',
        sources: 'http://localhost:5173/sources',
      },
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FarmGate Hub API • Status & Explorer</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f8f8; color: #0a0a0a; margin: 0; padding: 40px 20px; }
    .container { max-width: 860px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { font-family: serif; font-size: 26px; margin: 0 0 4px 0; color: #1f6b3a; }
    .badge { display: inline-block; font-size: 11px; font-weight: bold; background: #eaf4ed; color: #1f6b3a; border: 1px solid rgba(31,107,58,0.2); padding: 3px 8px; border-radius: 999px; margin-bottom: 12px; }
    p { color: #555; font-size: 14px; line-height: 1.6; margin-top: 0; }
    .section-title { font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-top: 24px; margin-bottom: 10px; font-weight: bold; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card { padding: 14px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; text-decoration: none; color: inherit; transition: all 0.15s; }
    .card:hover { border-color: #1f6b3a; background: #f0f7f2; }
    .card-title { font-weight: bold; font-size: 14px; color: #0a0a0a; }
    .card-desc { font-size: 12px; color: #666; margin-top: 4px; font-family: monospace; }
    .api-list { background: #18181b; color: #e4e4e7; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 12px; line-height: 1.8; }
    .api-list a { color: #4ade80; text-decoration: none; }
    .api-list a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">● API ENGINE ONLINE • PORT 8787</span>
    <h1>FarmGate Hub API Gateway</h1>
    <p>Hono + SQLite (Drizzle ORM) backend with simulated hardware adapters for the FarmGate Hub platform.</p>

    <div class="section-title">Frontend Applications (Port 5173 & 4000)</div>
    <div class="grid">
      <a class="card" href="http://localhost:5173/farmer" target="_blank">
        <div class="card-title">🌾 Farmer Mobile App →</div>
        <div class="card-desc">http://localhost:5173/farmer</div>
      </a>
      <a class="card" href="http://localhost:5173/hub" target="_blank">
        <div class="card-title">📦 Hub Operator Console →</div>
        <div class="card-desc">http://localhost:5173/hub</div>
      </a>
      <a class="card" href="http://localhost:5173/impact" target="_blank">
        <div class="card-title">📈 Impact Dashboard →</div>
        <div class="card-desc">http://localhost:5173/impact</div>
      </a>
      <a class="card" href="http://localhost:4000" target="_blank">
        <div class="card-title">🚀 Investor Pitch Site →</div>
        <div class="card-desc">http://localhost:4000</div>
      </a>
      <a class="card" href="http://localhost:5173/buyer" target="_blank">
        <div class="card-title">🛒 Buyer Wholesale Portal →</div>
        <div class="card-desc">http://localhost:5173/buyer</div>
      </a>
      <a class="card" href="http://localhost:5173/t/LOT-214" target="_blank">
        <div class="card-title">🔍 QR Traceability →</div>
        <div class="card-desc">http://localhost:5173/t/LOT-214</div>
      </a>
      <a class="card" href="http://localhost:5173/channels" target="_blank">
        <div class="card-title">💬 Channels (WhatsApp / IVR) →</div>
        <div class="card-desc">http://localhost:5173/channels</div>
      </a>
      <a class="card" href="http://localhost:8080" target="_blank">
        <div class="card-title">⚡ Gateway Launcher →</div>
        <div class="card-desc">http://localhost:8080</div>
      </a>
    </div>

    <div class="section-title">Core REST & SSE Endpoints</div>
    <div class="api-list">
      <div>GET <a href="/health">/health</a> — Service status check</div>
      <div>GET <a href="/api/prices/today?crop=tomato">/api/prices/today?crop=tomato</a> — Today's mandi & verified buyer prices</div>
      <div>GET <a href="/api/lots">/api/lots</a> — Active farmer lots & status</div>
      <div>GET <a href="/api/hub/pod">/api/hub/pod</a> — 10T cool pod sensor telemetry</div>
      <div>GET <a href="/api/hub/orders">/api/hub/orders</a> — Wholesale buyer open orders</div>
      <div>GET <a href="/api/advances/pending">/api/advances/pending</a> — Pending farmer advance requests</div>
      <div>GET <a href="/api/receipts/lot_198">/api/receipts/lot_198</a> — Rupee waterfall receipt for Lot #198</div>
      <div>GET <a href="/api/impact/kpis">/api/impact/kpis</a> — 5 core impact scorecard metrics</div>
      <div>GET <a href="/api/impact/network">/api/impact/network</a> — 4-year cohort financial model</div>
      <div>GET <a href="/t/FGH-ANNUR-2026-LOT214">/t/FGH-ANNUR-2026-LOT214</a> — Public lot traceability verification</div>
      <div>GET <a href="/api/events">/api/events</a> — Server-Sent Events (SSE) live push stream</div>
    </div>
  </div>
</body>
</html>`;
  return c.html(html);
});

// Mount sub-routers complying with Section 7 API routes
app.route('/api/demo', authRouter);
app.route('/api/demo', demoRouter);
app.get('/api/me', (c) => authRouter.fetch(new Request('http://localhost/me', { headers: c.req.raw.headers })));
app.route('/api/prices', pricesRouter);
app.route('/api/farmers', lotsRouter);
app.route('/api/lots', lotsRouter);
app.route('/api/advances', advancesRouter);
app.route('/api/hub', hubRouter);
app.route('/api/buyer', buyerRouter);
app.route('/api/receipts', receiptsRouter);
app.route('/api/impact', impactRouter);
app.route('/api/channels', channelsRouter);
app.route('/api/events', eventsRouter);
app.route('/t', traceabilityRouter);

// Start server if run directly
const port = 8787;
if (process.env.NODE_ENV !== 'test') {
  console.log(`FarmGate Hub API starting on port ${port}...`);
  serve({
    fetch: app.fetch,
    port,
  });
}
