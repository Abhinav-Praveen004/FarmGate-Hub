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
