import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { systemClock } from '../clock/index.js';
import {
  defaultScaleDevice,
  defaultSensorFeed,
  defaultChannelProvider,
  defaultPaymentProvider,
} from '../adapters/index.js';
import {
  evaluateTomatoGrading,
  applyGradeOverride,
  calculateFarmerFeePaisePerKg,
  paiseToRupees,
} from '@farmgate/shared';

export const hubRouter = new Hono();

// 1. Intake Wizard
hubRouter.post('/intake', async (c) => {
  const body = await c.req.json();
  const {
    farmerId,
    crop,
    weightGrams,
    quality,
    overrideGrade,
    overrideReason,
  } = body;

  const capturedWeightGrams = weightGrams || defaultScaleDevice.getLiveReadingGrams();
  const grading = evaluateTomatoGrading(quality);
  let finalGrade = grading.suggestedGrade;
  let auditReason = '';

  if (overrideGrade && overrideGrade !== grading.suggestedGrade) {
    const overrideRes = applyGradeOverride(grading.suggestedGrade, {
      overrideGrade,
      reason: overrideReason || 'Manual visual inspection override',
      operatorId: 'operator_ravi',
      timestamp: systemClock.toISOString(),
    });
    finalGrade = overrideRes.finalGrade;
    auditReason = overrideRes.auditLogEntry;
  }

  // Get next lot number
  const existingLots = db.select().from(schema.lots).all();
  const nextLotNumber = existingLots.length > 0 ? Math.max(...existingLots.map((l) => l.lotNumber)) + 1 : 214;
  const lotId = `lot_${nextLotNumber}`;
  const nowIso = systemClock.toISOString();
  const qrCode = `FGH-ANNUR-2026-LOT${nextLotNumber}`;

  const timeline = [
    {
      timestamp: nowIso,
      status: 'received',
      actor: 'Ravi (Hub Operator)',
      note: `Weighed on digital scale: ${capturedWeightGrams / 1000} kg of ${crop}`,
    },
    {
      timestamp: nowIso,
      status: 'graded',
      actor: 'Ravi (Hub Operator)',
      note: `Graded ${finalGrade}${auditReason ? ` (${auditReason})` : ''}`,
    },
    {
      timestamp: nowIso,
      status: 'in_pod',
      actor: 'System',
      note: 'Placed into cool pod. 72h holding timer started.',
    },
  ];

  db.insert(schema.lots).values({
    id: lotId,
    lotNumber: nextLotNumber,
    farmerId: farmerId || 'farmer_meena',
    crop: crop || 'tomato',
    weightGrams: capturedWeightGrams,
    grade: finalGrade,
    status: 'in_pod',
    intakePriceEstimatePaise: 1400,
    holdingLimitHours: 72,
    receivedAt: nowIso,
    hoursInPod: 0,
    qrCode,
    qualityJson: JSON.stringify(quality),
    timelineJson: JSON.stringify(timeline),
    advanceRequested: false,
    advanceSettled: false,
  }).run();

  // Update physical pod telemetry occupancy
  defaultSensorFeed.addProduce(capturedWeightGrams / 1000);

  // Send outbound simulated alert
  await defaultChannelProvider.sendMessage({
    farmerId: farmerId || 'farmer_meena',
    phone: '+91 00000 00001',
    channel: 'whatsapp',
    text: `Lot #${nextLotNumber} received: ${capturedWeightGrams / 1000} kg, Grade ${finalGrade}. QR: ${qrCode}. Stored in cool pod. Check app for prices.`,
  });

  return c.json({
    success: true,
    lot: {
      id: lotId,
      lotNumber: nextLotNumber,
      grade: finalGrade,
      weightGrams: capturedWeightGrams,
      qrCode,
    },
  });
});

// 2. Pod Board Telemetry
hubRouter.get('/pod', async (c) => {
  const telemetry = defaultSensorFeed.getTelemetry();
  const lotsInPod = db
    .select()
    .from(schema.lots)
    .where(eq(schema.lots.status, 'in_pod'))
    .all()
    .map((l) => ({
      ...l,
      quality: JSON.parse(l.qualityJson),
      timeline: JSON.parse(l.timelineJson),
      remainingHours: Math.max(0, l.holdingLimitHours - l.hoursInPod),
    }));

  return c.json({
    telemetry,
    lots: lotsInPod,
    totalLotsInPod: lotsInPod.length,
  });
});

// Pod Simulation Controls (Power cut, Open Door)
hubRouter.post('/pod/simulate', async (c) => {
  const body = await c.req.json();
  const action = body.action || body.fault;

  if (action === 'power_cut') {
    defaultSensorFeed.triggerPowerCut();
  } else if (action === 'restore_grid' || action === 'normal') {
    defaultSensorFeed.restoreGrid();
  } else if (action === 'open_door' || action === 'door_open') {
    defaultSensorFeed.triggerDoorOpen(true);
  } else if (action === 'close_door') {
    defaultSensorFeed.triggerDoorOpen(false);
  }

  return c.json({ success: true, telemetry: defaultSensorFeed.getTelemetry() });
});

hubRouter.post('/pod/fault', async (c) => {
  const body = await c.req.json();
  const fault = body.fault || body.action;

  if (fault === 'power_cut') {
    defaultSensorFeed.triggerPowerCut();
  } else if (fault === 'normal' || fault === 'restore_grid') {
    defaultSensorFeed.restoreGrid();
  } else if (fault === 'door_open') {
    defaultSensorFeed.triggerDoorOpen(true);
  } else if (fault === 'close_door') {
    defaultSensorFeed.triggerDoorOpen(false);
  }

  return c.json({ success: true, telemetry: defaultSensorFeed.getTelemetry() });
});

// 3. Open Buyer Orders
hubRouter.get('/orders', async (c) => {
  const orders = db.select().from(schema.buyerOrders).all();
  return c.json({ orders });
});

// 4. Build Collective Load
hubRouter.post('/loads', async (c) => {
  const body = await c.req.json();
  const { buyerOrderId, lotIds } = body;

  const order = db.select().from(schema.buyerOrders).where(eq(schema.buyerOrders.id, buyerOrderId)).get();
  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  const allLots = db.select().from(schema.lots).all();
  const selectedLots = allLots.filter((l) =>
    lotIds.some((id: string) => {
      const normalizedId = id.toLowerCase().replace('-', '_');
      const lotNorm = l.id.toLowerCase().replace('-', '_');
      return lotNorm === normalizedId || l.lotNumber === Number(id.replace(/\D/g, ''));
    })
  );
  const totalWeightGrams = selectedLots.reduce((acc, l) => acc + l.weightGrams, 0);

  const loadId = `load_${Date.now()}`;
  const nowIso = systemClock.toISOString();

  db.insert(schema.collectiveLoads).values({
    id: loadId,
    buyerOrderId,
    crop: order.crop,
    grade: order.grade,
    totalWeightGrams,
    pricePaisePerKg: order.offeredPricePaisePerKg,
    lotIdsJson: JSON.stringify(lotIds),
    status: 'created',
    createdAt: nowIso,
  }).run();

  return c.json({ success: true, loadId, totalWeightGrams, lotCount: lotIds.length });
});

// 5. Confirm Collective Sale & Dispatch
hubRouter.post('/loads/:id/confirm', async (c) => {
  const loadId = c.req.param('id');
  const nowIso = systemClock.toISOString();

  const load = db.select().from(schema.collectiveLoads).where(eq(schema.collectiveLoads.id, loadId)).get();
  if (!load) {
    return c.json({ error: 'Load not found' }, 404);
  }

  const lotIds: string[] = JSON.parse(load.lotIdsJson);

  // Update load status
  db.update(schema.collectiveLoads)
    .set({ status: 'dispatched', dispatchedAt: nowIso })
    .where(eq(schema.collectiveLoads.id, loadId))
    .run();

  // For each lot: transition to sold, deduct fees, create payout with 24h SLA
  const allExistingLots = db.select().from(schema.lots).all();
  for (const lId of lotIds) {
    const lot = allExistingLots.find((l) => {
      const normalizedId = lId.toLowerCase().replace('-', '_');
      const lotNorm = l.id.toLowerCase().replace('-', '_');
      return lotNorm === normalizedId || l.lotNumber === Number(lId.replace(/\D/g, ''));
    });
    if (!lot) continue;

    const timeline = JSON.parse(lot.timelineJson);
    timeline.push({
      timestamp: nowIso,
      status: 'sold',
      actor: 'Ravi (Hub Operator)',
      note: `Collective load dispatched to Annapurna Kirana Network at ₹${paiseToRupees(load.pricePaisePerKg)}/kg`,
    });

    db.update(schema.lots)
      .set({
        status: 'sold',
        finalSalePricePaisePerKg: load.pricePaisePerKg,
        soldAt: nowIso,
        timelineJson: JSON.stringify(timeline),
      })
      .where(eq(schema.lots.id, lot.id))
      .run();

    // Check if farmer had an advance
    const advance = db.select().from(schema.advances).where(eq(schema.advances.lotId, lot.id)).get();
    const advanceRecoveredPaise = advance?.status === 'approved' ? advance.approvedAmountPaise || 0 : 0;

    const weightKg = lot.weightGrams / 1000;
    const grossPaise = weightKg * load.pricePaisePerKg;
    const feePerKgPaise = calculateFarmerFeePaisePerKg(load.pricePaisePerKg);
    const totalFeesPaise = weightKg * feePerKgPaise;
    const netPaidPaise = Math.max(0, grossPaise - totalFeesPaise - advanceRecoveredPaise);

    // 24-hour SLA due timestamp
    const dueAtIso = new Date(new Date(nowIso).getTime() + 24 * 3600 * 1000).toISOString();

    db.insert(schema.payouts).values({
      id: `pay_${lot.id}`,
      lotId: lot.id,
      farmerId: lot.farmerId,
      grossAmountPaise: Math.round(grossPaise),
      feeDeductedPaise: Math.round(totalFeesPaise),
      advanceRecoveredPaise,
      netPaidPaise: Math.round(netPaidPaise),
      dueAt: dueAtIso,
      status: 'pending',
    }).run();

    // Generate Receipt
    const farmer = db.select().from(schema.farmers).where(eq(schema.farmers.id, lot.farmerId)).get();
    db.insert(schema.receipts).values({
      id: `rec_${lot.id}`,
      lotId: lot.id,
      farmerName: farmer?.name || 'Farmer',
      crop: lot.crop as any,
      weightKg,
      consumerReferencePricePaisePerKg: 3000,
      transportCostPaisePerKg: 300,
      handlingWastagePaisePerKg: 350,
      intermediaryMarginPaisePerKg: 1000,
      farmerGrossPricePaisePerKg: load.pricePaisePerKg,
      farmerSharePercent: Math.round((load.pricePaisePerKg / 3000) * 100),
      hubStorageFeePaisePerKg: 150,
      hubCommissionPaisePerKg: Math.round(load.pricePaisePerKg * 0.03),
      totalHubFeePaisePerKg: feePerKgPaise,
      netFarmerPricePaisePerKg: load.pricePaisePerKg - feePerKgPaise,
      grossSalePaise: Math.round(grossPaise),
      totalFeesPaise: Math.round(totalFeesPaise),
      advanceDeductedPaise: advanceRecoveredPaise,
      netPaidPaise: Math.round(netPaidPaise),
      typicalSharePercent: 33,
      issuedAt: nowIso,
    }).run();
  }

  return c.json({ success: true, loadId, status: 'dispatched' });
});

// 6. Payouts Queue with 24-Hour SLA Clocks
hubRouter.get('/payouts', async (c) => {
  const allPayouts = db.select().from(schema.payouts).all();
  const nowEpoch = systemClock.now().getTime();

  const formatted = allPayouts.map((p) => {
    const dueEpoch = new Date(p.dueAt).getTime();
    const remainingMs = dueEpoch - nowEpoch;
    const remainingHours = Math.max(0, Math.round(remainingMs / (3600 * 1000) * 10) / 10);
    return {
      ...p,
      remainingHours,
      isOverdue: remainingMs < 0,
    };
  });

  return c.json({ payouts: formatted });
});

// 7. Settle Payout via Simulated UPI
hubRouter.post('/payouts/:id/settle', async (c) => {
  const payoutId = c.req.param('id');
  const nowIso = systemClock.toISOString();

  const payout = db.select().from(schema.payouts).where(eq(schema.payouts.id, payoutId)).get();
  if (!payout) {
    return c.json({ error: 'Payout not found' }, 404);
  }

  const farmer = db.select().from(schema.farmers).where(eq(schema.farmers.id, payout.farmerId)).get();
  const upiId = farmer?.upiId || 'farmer@demo';

  const payResult = await defaultPaymentProvider.sendPayout(
    upiId,
    payout.netPaidPaise,
    `FarmGate Hub collective sale payout for Lot #${payout.lotId}`
  );

  if (!payResult.success) {
    return c.json({ success: false, error: payResult.errorMessage }, 500);
  }

  db.update(schema.payouts)
    .set({
      status: 'settled',
      paidAt: nowIso,
      upiTransactionId: payResult.transactionId,
    })
    .where(eq(schema.payouts.id, payoutId))
    .run();

  // Update lot to 'paid'
  db.update(schema.lots)
    .set({ status: 'paid' })
    .where(eq(schema.lots.id, payout.lotId))
    .run();

  // Ledger entries: Debit farmer payable, Credit cash
  db.insert(schema.ledgerEntries).values([
    {
      id: `led_pay_${Date.now()}`,
      transactionType: 'farmer_payable',
      debitPaise: payout.netPaidPaise,
      creditPaise: 0,
      referenceLotId: payout.lotId,
      note: `UPI Payout settled to ${upiId}`,
      createdAt: nowIso,
    },
  ]).run();

  await defaultChannelProvider.sendMessage({
    farmerId: payout.farmerId,
    phone: farmer?.phone || '+91 00000 00001',
    channel: 'whatsapp',
    text: `Payout settled: ₹${paiseToRupees(payout.netPaidPaise)} transferred to ${upiId} via UPI (${payResult.transactionId}). View receipt in app.`,
  });

  return c.json({
    success: true,
    payoutId,
    status: 'settled',
    transactionId: payResult.transactionId,
  });
});

// 8. Grade-C Waste-to-Value Routing
const gradeCState = {
  inventoryKg: 180,
  cumulativeDivertedKg: 1420,
  cumulativeRescuedRupees: 6390,
  dispatches: [
    {
      id: 'GC-BATCH-07',
      processor: 'Sahyadri Agro Puree & Pulp',
      product: 'Bulk aseptic tomato paste',
      weightKg: 240,
      rateRupeesKg: 4.20,
      totalRecoveryRupees: 1008,
      timestamp: 'Today 11:30 AM',
      status: 'DELIVERED',
    },
    {
      id: 'GC-BATCH-06',
      processor: 'Kolar Solar Dehydration Co-op',
      product: 'Sun-dried tomato flakes',
      weightKg: 150,
      rateRupeesKg: 4.50,
      totalRecoveryRupees: 675,
      timestamp: 'Yesterday 16:45 PM',
      status: 'DELIVERED',
    },
  ],
};

hubRouter.get('/grade-c', async (c) => {
  return c.json(gradeCState);
});

hubRouter.post('/grade-c/route', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const processor = body.processor || 'Kolar Solar Dehydration Co-op';
  const product = body.product || 'Sun-dried tomato flakes';
  const rateRupeesKg = Number(body.rateRupeesKg) || 4.50;
  const weightKg = Math.min(Number(body.weightKg) || gradeCState.inventoryKg, gradeCState.inventoryKg);

  if (weightKg <= 0) {
    return c.json({ error: 'No inventory to route' }, 400);
  }

  const recovery = Math.round(weightKg * rateRupeesKg * 100) / 100;
  const dispatchId = `GC-BATCH-${String(gradeCState.dispatches.length + 8).padStart(2, '0')}`;

  gradeCState.inventoryKg = Math.max(0, gradeCState.inventoryKg - weightKg);
  gradeCState.cumulativeDivertedKg += weightKg;
  gradeCState.cumulativeRescuedRupees += recovery;

  const newDispatch = {
    id: dispatchId,
    processor,
    product,
    weightKg,
    rateRupeesKg,
    totalRecoveryRupees: recovery,
    timestamp: 'Just now',
    status: 'IN TRANSIT',
  };

  gradeCState.dispatches.unshift(newDispatch);

  return c.json({
    success: true,
    dispatch: newDispatch,
    updatedState: gradeCState,
  });
});

hubRouter.post('/grade-c/restock', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const addKg = Number(body.addKg) || 60;
  gradeCState.inventoryKg += addKg;
  return c.json({ success: true, inventoryKg: gradeCState.inventoryKg });
});
