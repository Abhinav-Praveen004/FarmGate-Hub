import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import {
  Crop,
  evaluatePriceAdvice,
  paiseToRupees,
} from '@farmgate/shared';

export const pricesRouter = new Hono();

pricesRouter.get('/:crop', async (c) => {
  const cropParam = c.req.param('crop') as Crop;
  const isT0 = c.req.query('t') === '0';

  // 1. Get Crop info & floor
  const cropInfo = db.select().from(schema.crops).where(eq(schema.crops.name, cropParam)).get();
  const floorPricePaise = cropInfo?.floorPricePaisePerKg ?? 1100;
  const floorPriceRupees = paiseToRupees(floorPricePaise);

  // 2. Get 14-day Mandi history
  const historyRows = db
    .select()
    .from(schema.mandiPrices)
    .where(eq(schema.mandiPrices.crop, cropParam))
    .all();

  const todayMandiRow = historyRows[historyRows.length - 1];
  const mandiPricePaise = todayMandiRow?.pricePaisePerKg ?? 900;
  const mandiPriceRupees = paiseToRupees(mandiPricePaise);

  // 3. Best buyer bid from open orders
  // If at T=0, bid is ₹10/kg (below floor); at T=14h (Screen 1 default), Annapurna's bid is ₹14/kg.
  let bestBidPaise = 1400; // ₹14.0 default
  if (isT0) {
    bestBidPaise = 1000; // ₹10.0 for T=0
  } else {
    const openOrders = db
      .select()
      .from(schema.buyerOrders)
      .where(eq(schema.buyerOrders.crop, cropParam))
      .orderBy(desc(schema.buyerOrders.offeredPricePaisePerKg))
      .all();
    if (openOrders.length > 0) {
      bestBidPaise = openOrders[0].offeredPricePaisePerKg;
    }
  }
  const bestBidRupees = paiseToRupees(bestBidPaise);

  // 4. Forecast 1-day range (Screen 1: ₹13 to ₹15/kg)
  const forecast1Day = {
    horizonHours: 24,
    expectedLowRupeesPerKg: 13.0,
    expectedMidRupeesPerKg: 14.0,
    expectedHighRupeesPerKg: 15.0,
  };

  // 5. Evaluate Advice
  const advice = evaluatePriceAdvice({
    crop: cropParam,
    currentMandiPriceRupeesPerKg: mandiPriceRupees,
    bestBuyerBidRupeesPerKg: bestBidRupees,
    floorPriceRupeesPerKg: floorPriceRupees,
    forecast1Day,
    remainingPodHoldHours: 58,
  });

  return c.json({
    crop: cropParam,
    mandiPrice: {
      paisePerKg: mandiPricePaise,
      rupeesPerKg: mandiPriceRupees,
      history: historyRows.map((h) => ({
        date: h.date,
        priceRupees: paiseToRupees(h.pricePaisePerKg),
      })),
    },
    bestBuyerBid: {
      paisePerKg: bestBidPaise,
      rupeesPerKg: bestBidRupees,
      buyerName: 'Annapurna Kirana Network',
    },
    floorPrice: {
      paisePerKg: floorPricePaise,
      rupeesPerKg: floorPriceRupees,
    },
    forecast1Day,
    advice,
    simulated: true,
  });
});
