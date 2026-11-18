import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { systemClock } from '../clock/index.js';
import { defaultChannelProvider } from '../adapters/index.js';
import { calculateBuyerMatch, paiseToRupees } from '@farmgate/shared';

export const lotsRouter = new Hono();

// Helper to format lot with quality, timeline, and buyer match
function formatLot(lot: typeof schema.lots.$inferSelect) {
  let quality = {};
  let timeline = [];
  try { quality = JSON.parse(lot.qualityJson); } catch {}
  try { timeline = JSON.parse(lot.timelineJson); } catch {}

  const match = calculateBuyerMatch({
    lotCrop: lot.crop as any,
    orderCrop: (lot.crop as any) || 'tomato',
    lotGrade: lot.grade as any,
    orderGrade: 'A',
    lotWeightGrams: lot.weightGrams,
    orderWeightGrams: 500_000,
    offeredPricePaisePerKg: 1400,
    floorPricePaisePerKg: 1100,
    remainingPodHours: Math.max(0, lot.holdingLimitHours - lot.hoursInPod),
    orderDeliveryWindowHours: 24,
    buyerReliabilityPercent: 92,
  });

  return {
    ...lot,
    quality,
    timeline,
    buyerMatchScore: match.totalScore,
    buyerMatchBreakdown: match.breakdown,
    remainingHoldHours: Math.max(0, lot.holdingLimitHours - lot.hoursInPod),
  };
}

// 1. GET / - List all lots or filter by farmerId
lotsRouter.get('/', async (c) => {
  const farmerId = c.req.query('farmerId');
  let lotsList: Array<typeof schema.lots.$inferSelect> = [];

  if (farmerId) {
    if (farmerId === 'FARMER-001' || farmerId === 'farmer_ramesh' || farmerId === 'farmer_meena') {
      lotsList = db
        .select()
        .from(schema.lots)
        .where(
          or(
            eq(schema.lots.farmerId, 'farmer_meena'),
            eq(schema.lots.farmerId, 'farmer_ramesh'),
            eq(schema.lots.farmerId, 'FARMER-001')
          )
        )
        .all();
    } else if (farmerId === 'FARMER-002' || farmerId === 'farmer_murugan') {
      lotsList = db
        .select()
        .from(schema.lots)
        .where(
          or(
            eq(schema.lots.farmerId, 'farmer_murugan'),
            eq(schema.lots.farmerId, 'FARMER-002')
          )
        )
        .all();
    } else if (farmerId === 'FARMER-003' || farmerId === 'farmer_lakshmi') {
      lotsList = db
        .select()
        .from(schema.lots)
        .where(
          or(
            eq(schema.lots.farmerId, 'farmer_lakshmi'),
            eq(schema.lots.farmerId, 'FARMER-003')
          )
        )
        .all();
    } else {
      lotsList = db
        .select()
        .from(schema.lots)
        .where(eq(schema.lots.farmerId, farmerId))
        .all();
    }
  } else {
    lotsList = db.select().from(schema.lots).all();
  }

  return c.json(lotsList.map(formatLot));
});

lotsRouter.get('/me/lots', async (c) => {
  // Return lots for Meena / Ramesh (active farmer)
  const lotsList = db
    .select()
    .from(schema.lots)
    .where(
      or(
        eq(schema.lots.farmerId, 'farmer_meena'),
        eq(schema.lots.farmerId, 'farmer_ramesh')
      )
    )
    .all();

  return c.json({ lots: lotsList.map(formatLot) });
});

lotsRouter.get('/:id', async (c) => {
  const lotId = c.req.param('id');
  const lot = db.select().from(schema.lots).where(eq(schema.lots.id, lotId)).get();
  if (!lot) {
    return c.json({ error: 'Lot not found' }, 404);
  }

  const quality = JSON.parse(lot.qualityJson);
  const timeline = JSON.parse(lot.timelineJson);

  const match = calculateBuyerMatch({
    lotCrop: lot.crop as any,
    orderCrop: 'tomato',
    lotGrade: lot.grade as any,
    orderGrade: 'A',
    lotWeightGrams: lot.weightGrams,
    orderWeightGrams: 500_000,
    offeredPricePaisePerKg: 1400,
    floorPricePaisePerKg: 1100,
    remainingPodHours: Math.max(0, lot.holdingLimitHours - lot.hoursInPod),
    orderDeliveryWindowHours: 24,
    buyerReliabilityPercent: 92,
  });

  return c.json({
    ...lot,
    quality,
    timeline,
    buyerMatchScore: match.totalScore,
    buyerMatchBreakdown: match.breakdown,
    remainingHoldHours: Math.max(0, lot.holdingLimitHours - lot.hoursInPod),
  });
});

lotsRouter.post('/:id/decision', async (c) => {
  const lotId = c.req.param('id');
  const body = await c.req.json();
  const rawAction = body.action || body.decision || '';
  const action = String(rawAction).toUpperCase(); // 'SELL' | 'HOLD'
  const holdHours = body.holdHours;
  const autoSell = body.autoSell ?? body.autoSellAtExpiry;

  const lot = db.select().from(schema.lots).where(eq(schema.lots.id, lotId)).get();
  if (!lot) {
    return c.json({ error: 'Lot not found' }, 404);
  }

  const timeline = JSON.parse(lot.timelineJson);
  const nowIso = systemClock.toISOString();

  if (action === 'SELL') {
    const salePricePaise = body.pricePaise || (body.priceRupees ? Math.round(body.priceRupees * 100) : 1400);
    timeline.push({
      timestamp: nowIso,
      status: 'sold',
      actor: 'Farmer (via App)',
      note: `Farmer accepted best buyer bid at ₹${paiseToRupees(salePricePaise)}/kg`,
    });

    db.update(schema.lots)
      .set({
        status: 'sold',
        finalSalePricePaisePerKg: salePricePaise,
        soldAt: nowIso,
        timelineJson: JSON.stringify(timeline),
      })
      .where(eq(schema.lots.id, lotId))
      .run();

    await defaultChannelProvider.sendMessage({
      farmerId: lot.farmerId,
      phone: '+91 00000 00001',
      channel: 'whatsapp',
      text: `Decision registered: SELL. Lot #${lot.lotNumber} (${lot.crop}) assigned to collective load at ₹${paiseToRupees(salePricePaise)}/kg.`,
    });

    return c.json({ success: true, status: 'sold', action: 'SELL' });
  }

  if (action === 'HOLD') {
    const chosenHours = holdHours || 48;
    timeline.push({
      timestamp: nowIso,
      status: 'in_pod',
      actor: 'Farmer (via App)',
      note: `Farmer chose to HOLD in cool pod for ${chosenHours} hours (auto-sell: ${autoSell ? 'ON' : 'OFF'}).`,
    });

    db.update(schema.lots)
      .set({
        holdingLimitHours: chosenHours,
        timelineJson: JSON.stringify(timeline),
      })
      .where(eq(schema.lots.id, lotId))
      .run();

    await defaultChannelProvider.sendMessage({
      farmerId: lot.farmerId,
      phone: '+91 00000 00001',
      channel: 'whatsapp',
      text: `Decision registered: HOLD for ${chosenHours}h. Cool pod climate is maintaining 11.5°C. Next alert in 24h.`,
    });

    return c.json({ success: true, status: 'in_pod', action: 'HOLD', holdingLimitHours: chosenHours });
  }

  return c.json({ error: 'Invalid action. Must be SELL or HOLD' }, 400);
});
