import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { systemClock } from '../clock/index.js';

export const advancesRouter = new Hono();

advancesRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { lotId, requestedAmountPaise } = body;

  const lot = db.select().from(schema.lots).where(eq(schema.lots.id, lotId)).get();
  if (!lot) {
    return c.json({ error: 'Lot not found' }, 404);
  }

  // Calculate default 60% if not specified
  const weightKg = lot.weightGrams / 1000;
  const priceEstimatePaise = lot.intakePriceEstimatePaise || 1000;
  const lotEstimatedValuePaise = weightKg * priceEstimatePaise;
  const amount = requestedAmountPaise || Math.round(lotEstimatedValuePaise * 0.6);

  const advId = `adv_${Date.now()}`;
  const nowIso = systemClock.toISOString();

  db.insert(schema.advances).values({
    id: advId,
    lotId: lot.id,
    farmerId: lot.farmerId,
    requestedAmountPaise: amount,
    approvedAmountPaise: amount, // Auto-approved in demo
    status: 'approved',
    requestedAt: nowIso,
    settledAt: undefined,
  }).run();

  db.update(schema.lots)
    .set({ advanceRequested: true })
    .where(eq(schema.lots.id, lot.id))
    .run();

  // Double entry ledger for advance disbursed
  db.insert(schema.ledgerEntries).values({
    id: `led_adv_${Date.now()}`,
    transactionType: 'advance',
    debitPaise: amount,
    creditPaise: 0,
    referenceLotId: lot.id,
    note: `Produce-backed advance disbursed for Lot #${lot.lotNumber}`,
    createdAt: nowIso,
  }).run();

  return c.json({
    success: true,
    advance: {
      id: advId,
      lotId: lot.id,
      amountPaise: amount,
      status: 'approved',
      simulated: true,
    },
  });
});

advancesRouter.post('/:id/approve', async (c) => {
  const advId = c.req.param('id');
  const nowIso = systemClock.toISOString();

  const advance = db.select().from(schema.advances).where(eq(schema.advances.id, advId)).get();
  if (!advance) {
    return c.json({ error: 'Advance not found' }, 404);
  }

  db.update(schema.advances)
    .set({ status: 'approved', approvedAmountPaise: advance.requestedAmountPaise })
    .where(eq(schema.advances.id, advId))
    .run();

  return c.json({ success: true, advanceId: advId, status: 'approved' });
});
