import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { systemClock } from '../clock/index.js';
import { defaultChannelProvider } from '../adapters/index.js';
import { calculateBuyerMatch } from '@farmgate/shared';

export const lotsRouter = new Hono();

lotsRouter.get('/me/lots', async (c) => {
  // Return lots for Meena (or active farmer)
  const lotsList = db
    .select()
    .from(schema.lots)
    .where(eq(schema.lots.farmerId, 'farmer_meena'))
    .all();

  const formatted = lotsList.map((lot) => {
    const quality = JSON.parse(lot.qualityJson);
    const timeline = JSON.parse(lot.timelineJson);

    // Calculate match against primary open order
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

    return {
      ...lot,
      quality,
      timeline,
      buyerMatchScore: match.totalScore,
      buyerMatchBreakdown: match.breakdown,
      remainingHoldHours: Math.max(0, lot.holdingLimitHours - lot.hoursInPod),
    };
  });

  return c.json({ lots: formatted });
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
  const { action, holdHours, autoSell } = body; // action: 'SELL' | 'HOLD'

  const lot = db.select().from(schema.lots).where(eq(schema.lots.id, lotId)).get();
  if (!lot) {
    return c.json({ error: 'Lot not found' }, 404);
  }

  const timeline = JSON.parse(lot.timelineJson);
  const nowIso = systemClock.toISOString();

  if (action === 'SELL') {
    timeline.push({
      timestamp: nowIso,
      status: 'sold',
      actor: 'Meena (Farmer via App)',
      note: 'Farmer accepted best buyer bid at ₹14.0/kg',
    });

    db.update(schema.lots)
      .set({
        status: 'sold',
        finalSalePricePaisePerKg: 1400,
        soldAt: nowIso,
        timelineJson: JSON.stringify(timeline),
      })
      .where(eq(schema.lots.id, lotId))
      .run();

    await defaultChannelProvider.sendMessage({
      farmerId: lot.farmerId,
      phone: '+91 00000 00001',
      channel: 'whatsapp',
      text: `Decision registered: SELL. Lot #${lot.lotNumber} assigned to collective load for Annapurna Kirana Network at ₹14.0/kg.`,
    });

    return c.json({ success: true, status: 'sold', action: 'SELL' });
  }

  if (action === 'HOLD') {
    const chosenHours = holdHours || 48;
    timeline.push({
      timestamp: nowIso,
      status: 'in_pod',
      actor: 'Meena (Farmer via App)',
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
