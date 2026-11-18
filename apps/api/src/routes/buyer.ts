import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { systemClock } from '../clock/index.js';

export const buyerRouter = new Hono();

// Standing Orders
buyerRouter.post('/orders', async (c) => {
  const body = await c.req.json();
  const {
    buyerId,
    crop,
    grade,
    quantityGrams,
    offeredPricePaisePerKg,
    deliveryWindowHours,
  } = body;

  const orderId = `order_${Date.now()}`;
  const nowIso = systemClock.toISOString();

  db.insert(schema.buyerOrders).values({
    id: orderId,
    buyerId: buyerId || 'buyer_annapurna',
    crop,
    grade,
    quantityGrams,
    offeredPricePaisePerKg,
    deliveryWindowHours: deliveryWindowHours || 24,
    depositCleared: true, // Simulated pre-commitment deposit cleared
    status: 'open',
    createdAt: nowIso,
  }).run();

  return c.json({
    success: true,
    order: {
      id: orderId,
      crop,
      grade,
      quantityGrams,
      offeredPricePaisePerKg,
      depositCleared: true,
      status: 'open',
    },
  });
});

buyerRouter.get('/orders', async (c) => {
  const orders = db.select().from(schema.buyerOrders).all();
  return c.json({ orders });
});

// Aggregated Graded Stock (Privacy-Preserving, DPDP Compliant)
buyerRouter.get('/stock', async (c) => {
  const allLots = db
    .select()
    .from(schema.lots)
    .where(eq(schema.lots.status, 'in_pod'))
    .all();

  const stockMap: Record<string, { crop: string; grade: string; totalWeightGrams: number; lotCount: number }> = {};

  for (const lot of allLots) {
    const key = `${lot.crop}_${lot.grade}`;
    if (!stockMap[key]) {
      stockMap[key] = {
        crop: lot.crop,
        grade: lot.grade,
        totalWeightGrams: 0,
        lotCount: 0,
      };
    }
    stockMap[key].totalWeightGrams += lot.weightGrams;
    stockMap[key].lotCount += 1;
  }

  const stockList = Object.values(stockMap).map((s) => ({
    ...s,
    totalWeightKg: s.totalWeightGrams / 1000,
  }));

  return c.json({
    stock: stockList,
    totalAvailableKg: stockList.reduce((acc, s) => acc + s.totalWeightKg, 0),
    simulated: true,
  });
});
