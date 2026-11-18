import { Hono } from 'hono';
import { systemClock } from '../clock/index.js';
import { runSeed } from '../db/seed.js';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { broadcastEvent } from './events.js';

export const demoRouter = new Hono();

// 1. Get current demo clock & simulation state
demoRouter.get('/state', (c) => {
  return c.json({
    clock: {
      currentTime: systemClock.toISOString(),
      offsetHours: systemClock.getOffsetHours(),
      mode: systemClock.getMode(),
    },
  });
});

demoRouter.get('/clock', (c) => {
  return c.json({
    currentTime: systemClock.toISOString(),
    offsetHours: systemClock.getOffsetHours(),
    mode: systemClock.getMode(),
  });
});

// 2. Advance time handler (shared for /advance and /clock/advance)
const handleAdvance = async (c: any) => {
  let body: any = {};
  try {
    body = await c.req.json();
  } catch {}
  const hours = Number(body?.hours) || 1;

  const newIso = systemClock.advance(hours);

  // Increment hours in pod for all lots currently in pod
  const inPodLots = db.select().from(schema.lots).where(eq(schema.lots.status, 'in_pod')).all();
  for (const lot of inPodLots) {
    db.update(schema.lots)
      .set({ hoursInPod: lot.hoursInPod + hours })
      .where(eq(schema.lots.id, lot.id))
      .run();
  }

  broadcastEvent('time_warp', {
    advancedHours: hours,
    currentSimulatedTime: newIso,
    totalOffsetHours: systemClock.getOffsetHours(),
  });

  return c.json({
    success: true,
    advancedHours: hours,
    simulatedTime: newIso,
    currentTime: newIso,
    offsetHours: systemClock.getOffsetHours(),
  });
};

demoRouter.post('/advance', handleAdvance);
demoRouter.post('/clock/advance', handleAdvance);

// 3. Set clock mode: 'actual' | 'simulated'
demoRouter.post('/clock/mode', async (c) => {
  let body: any = {};
  try {
    body = await c.req.json();
  } catch {}
  const mode = body?.mode === 'actual' ? 'actual' : 'simulated';
  systemClock.setMode(mode);

  broadcastEvent('clock_mode', {
    mode,
    currentTime: systemClock.toISOString(),
  });

  return c.json({
    success: true,
    mode,
    currentTime: systemClock.toISOString(),
  });
});

demoRouter.post('/reset', (c) => {
  systemClock.reset(0);
  const seedRes = runSeed();

  broadcastEvent('demo_reset', {
    currentSimulatedTime: systemClock.toISOString(),
  });

  return c.json({
    success: true,
    message: 'Database reset to initial deterministic seed state.',
    seededLots: seedRes.seededLots,
    simulatedTime: systemClock.toISOString(),
  });
});

demoRouter.post('/scenario/:name', async (c) => {
  const scenario = c.req.param('name');

  if (scenario === 'golden_path_t0') {
    systemClock.reset(0);
    runSeed();
    return c.json({ success: true, scenario, message: 'Reset to T=0 Intake state' });
  }

  if (scenario === 'golden_path_t14') {
    systemClock.reset(14);
    runSeed();
    return c.json({ success: true, scenario, message: 'Fast-forwarded to T+14h (Annapurna bid active, Screen 1 SELL advice)' });
  }

  return c.json({ error: `Unknown scenario: ${scenario}` }, 400);
});
