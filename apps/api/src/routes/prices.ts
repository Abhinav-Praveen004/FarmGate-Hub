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

// Helper to resolve price info for any crop
async function getPriceDataForCrop(cropName: string, isT0: boolean) {
  const cropParam = (cropName || 'tomato').toLowerCase() as Crop;

  // 1. Get Crop info & floor
  const cropInfo = db.select().from(schema.crops).where(eq(schema.crops.name, cropParam)).get();

  // Baseline fallbacks per crop
  const defaults: Record<string, { floor: number; mandi: number; bid: number; buyer: string; low: number; mid: number; high: number }> = {
    tomato: { floor: 1100, mandi: 900, bid: 1400, buyer: 'Annapurna Kirana Network', low: 13.0, mid: 14.0, high: 15.0 },
    onion: { floor: 1800, mandi: 1500, bid: 2200, buyer: 'FreshBite Restaurant Group', low: 20.0, mid: 22.0, high: 24.0 },
    potato: { floor: 1400, mandi: 1200, bid: 1700, buyer: 'Sahyadri Institutional Kitchens', low: 16.0, mid: 17.0, high: 18.0 },
    chilli: { floor: 3200, mandi: 2800, bid: 4000, buyer: 'Kisan Agro Foods', low: 38.0, mid: 40.0, high: 44.0 },
    banana: { floor: 1600, mandi: 1300, bid: 1900, buyer: 'Annapurna Kirana Network', low: 17.0, mid: 19.0, high: 21.0 },
    mango: { floor: 4500, mandi: 3800, bid: 5500, buyer: 'FreshBite Restaurant Group', low: 50.0, mid: 55.0, high: 60.0 },
  };

  const cropDefaults = defaults[cropParam] || defaults.tomato;

  const floorPricePaise = cropInfo?.floorPricePaisePerKg ?? cropDefaults.floor;
  const floorPriceRupees = paiseToRupees(floorPricePaise);

  // 2. 14-day Mandi history
  const historyRows = db
    .select()
    .from(schema.mandiPrices)
    .where(eq(schema.mandiPrices.crop, cropParam))
    .all();

  const todayMandiRow = historyRows[historyRows.length - 1];
  const mandiPricePaise = todayMandiRow?.pricePaisePerKg ?? cropDefaults.mandi;
  const mandiPriceRupees = paiseToRupees(mandiPricePaise);

  // 3. Best buyer bid from open orders
  let bestBidPaise = cropDefaults.bid;
  let buyerName = cropDefaults.buyer;

  if (isT0) {
    bestBidPaise = 1000; // ₹10.0 for T=0 tomato test
  } else {
    const openOrders = db
      .select()
      .from(schema.buyerOrders)
      .where(eq(schema.buyerOrders.crop, cropParam))
      .orderBy(desc(schema.buyerOrders.offeredPricePaisePerKg))
      .all();
    if (openOrders.length > 0) {
      bestBidPaise = openOrders[0].offeredPricePaisePerKg;
      const buyer = db.select().from(schema.buyers).where(eq(schema.buyers.id, openOrders[0].buyerId)).get();
      if (buyer) {
        buyerName = buyer.name;
      }
    }
  }
  const bestBidRupees = paiseToRupees(bestBidPaise);

  // 4. Forecast 1-day range
  const forecast1Day = {
    horizonHours: 24,
    expectedLowRupeesPerKg: cropDefaults.low,
    expectedMidRupeesPerKg: cropDefaults.mid,
    expectedHighRupeesPerKg: cropDefaults.high,
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

  return {
    crop: cropParam,
    mandiPriceRupees,
    buyerBidRupees: bestBidRupees,
    floorPriceRupees,
    forecastLowRupees: forecast1Day.expectedLowRupeesPerKg,
    forecastHighRupees: forecast1Day.expectedHighRupeesPerKg,
    adviceSentence: advice.explanation,
    recommendedAction: advice.recommendedAction,
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
      buyerName,
    },
    floorPrice: {
      paisePerKg: floorPricePaise,
      rupeesPerKg: floorPriceRupees,
    },
    forecast1Day,
    advice,
    simulated: true,
  };
}

// Route 1: Explicit /today endpoint with ?crop= query parameter
pricesRouter.get('/today', async (c) => {
  const cropParam = c.req.query('crop') || 'tomato';
  const isT0 = c.req.query('t') === '0';
  const data = await getPriceDataForCrop(cropParam, isT0);
  return c.json(data);
});

// Route 2: /:crop parameter endpoint (supports /tomato, /onion, etc.)
pricesRouter.get('/:crop', async (c) => {
  let cropParam = c.req.param('crop');
  if (cropParam === 'today') {
    cropParam = c.req.query('crop') || 'tomato';
  }
  const isT0 = c.req.query('t') === '0';
  const data = await getPriceDataForCrop(cropParam, isT0);
  return c.json(data);
});
