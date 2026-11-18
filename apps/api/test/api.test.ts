import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../src/index.js';
import { runSeed } from '../src/db/seed.js';
import { db } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';

beforeAll(() => {
  // Ensure database is in fresh deterministic seed state
  runSeed();
});

describe('M2 Acceptance Tests: Screen 1, 2, and 3 Exact Values Through API', () => {
  it('Screen 1 (Today\'s Price): returns mandi ₹9/kg, buyer bid ₹14/kg, hold 1-day ₹13-15, advice SELL', async () => {
    const res = await app.request('/api/prices/tomato');
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.crop).toBe('tomato');
    expect(json.mandiPrice.rupeesPerKg).toBe(9.0); // Mandi ₹9/kg
    expect(json.bestBuyerBid.rupeesPerKg).toBe(14.0); // Buyer bid ₹14/kg
    expect(json.floorPrice.rupeesPerKg).toBe(11.0); // FPO floor ₹11/kg

    // Hold 1-day forecast range: ₹13 to ₹15/kg
    expect(json.forecast1Day.expectedLowRupeesPerKg).toBe(13.0);
    expect(json.forecast1Day.expectedMidRupeesPerKg).toBe(14.0);
    expect(json.forecast1Day.expectedHighRupeesPerKg).toBe(15.0);

    // Advice: SELL recommendation with clear explanation
    expect(json.advice.recommendedAction).toBe('SELL');
    expect(json.advice.explanation).toContain('Recommend selling now');
  });

  it('Screen 1 (T=0 variant): returns HOLD when best bid is below floor', async () => {
    const res = await app.request('/api/prices/tomato?t=0');
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.bestBuyerBid.rupeesPerKg).toBe(10.0); // Below ₹11 floor
    expect(json.advice.recommendedAction).toBe('HOLD');
    expect(json.advice.explanation).toContain('Recommend holding in the cool pod');
  });

  it('Screen 2 (My Lots): returns Lot #214 with 120 kg, Grade A, in pod 14 hours, buyer match 78%', async () => {
    const res = await app.request('/api/lots/lot_214');
    expect(res.status).toBe(200);

    const lot = await res.json();
    expect(lot.lotNumber).toBe(214);
    expect(lot.weightGrams / 1000).toBe(120.0); // 120 kg
    expect(lot.grade).toBe('A');
    expect(lot.status).toBe('in_pod');
    expect(lot.hoursInPod).toBe(14); // 14 hours in cool pod
    expect(lot.buyerMatchScore).toBe(78); // Buyer match 78%
    expect(lot.qrCode).toBe('FGH-ANNUR-2026-LOT214');

    // Quality check inputs
    expect(lot.quality.blemishPercent).toBe(3);
    expect(lot.quality.firmness).toBe(4);
  });

  it('Screen 3 (Where Your Rupee Went): returns Lot #198 exact receipt and waterfall math', async () => {
    const res = await app.request('/api/receipts/lot_198');
    expect(res.status).toBe(200);

    const receipt = await res.json();
    // Consumer paid ₹30/kg
    expect(receipt.waterfall.consumerPrice.rupeesPerKg).toBe(30.0);

    // Farmer gross received: ₹13.50/kg (45%)
    expect(receipt.waterfall.farmerGross.rupeesPerKg).toBe(13.5);
    expect(receipt.waterfall.farmerGross.sharePercent).toBe(45);

    // Hub fee: ₹1.9/kg (exact ₹1.905: ₹1.50 + 3% of ₹13.5)
    expect(receipt.waterfall.hubFee.totalRupeesPerKg).toBeCloseTo(1.91, 2);

    // Net paid to farmer: ₹11.6/kg (exact ₹11.595, shown as ₹11.6/kg)
    expect(receipt.waterfall.farmerNet.rupeesPerKg).toBeCloseTo(11.6, 1);

    // Non-farmer split
    expect(receipt.waterfall.transport.rupeesPerKg).toBe(3.0);
    expect(receipt.waterfall.handlingWastage.rupeesPerKg).toBe(3.5);
    expect(receipt.waterfall.intermediaryMargin.rupeesPerKg).toBe(10.0);

    // Typical share comparison marker (33%)
    expect(receipt.waterfall.typicalSharePercent).toBe(33);

    // Ledger summary (100 kg lot)
    expect(receipt.ledgerSummary.grossSaleRupees).toBe(1350.0);
    expect(receipt.ledgerSummary.totalFeesRupees).toBe(190.5);
    expect(receipt.ledgerSummary.netPaidRupees).toBe(1159.5);
  });
});

describe('M2 Acceptance Tests: Section 4.7 Network Model Match', () => {
  it('GET /api/impact/network equals Section 4.7 report values across all 4 years', async () => {
    const res = await app.request('/api/impact/network');
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.matchesReportBadge).toBe(true);
    expect(json.years).toHaveLength(4);

    const [y1, y2, y3, y4] = json.years;

    // Year 1
    expect(y1.hubsLive).toBe(3);
    expect(y1.farmersServed).toBe(600);
    expect(y1.produceHandledTonnes).toBe(1800);
    expect(y1.revenueCrore).toBe(0.53);
    expect(y1.hubOperatingCostCrore).toBe(0.78);
    expect(y1.centralCostCrore).toBe(0.60);
    expect(y1.ebitdaCrore).toBe(-0.86);
    expect(y1.hubCapitalSpendCrore).toBe(0.75);
    expect(y1.extraFarmerIncomeCrore).toBe(0.68);

    // Year 2
    expect(y2.hubsLive).toBe(10);
    expect(y2.farmersServed).toBe(2450);
    expect(y2.produceHandledTonnes).toBe(7800);
    expect(y2.revenueCrore).toBe(2.31);
    expect(y2.hubOperatingCostCrore).toBe(2.66);
    expect(y2.centralCostCrore).toBe(1.00);
    expect(y2.ebitdaCrore).toBe(-1.36);
    expect(y2.hubCapitalSpendCrore).toBe(1.75);
    expect(y2.extraFarmerIncomeCrore).toBe(2.79);

    // Year 3
    expect(y3.hubsLive).toBe(25);
    expect(y3.farmersServed).toBe(6950);
    expect(y3.produceHandledTonnes).toBe(23400);
    expect(y3.revenueCrore).toBe(6.98);
    expect(y3.hubOperatingCostCrore).toBe(6.82);
    expect(y3.centralCostCrore).toBe(1.60);
    expect(y3.ebitdaCrore).toBe(-1.45);
    expect(y3.hubCapitalSpendCrore).toBe(3.75);
    expect(y3.extraFarmerIncomeCrore).toBe(7.92);

    // Year 4
    expect(y4.hubsLive).toBe(25);
    expect(y4.farmersServed).toBe(10250);
    expect(y4.produceHandledTonnes).toBe(38000);
    expect(y4.revenueCrore).toBe(11.50);
    expect(y4.hubOperatingCostCrore).toBe(7.40);
    expect(y4.centralCostCrore).toBe(2.00);
    expect(y4.ebitdaCrore).toBe(2.10);
    expect(y4.ebitdaMarginPercent).toBe(18);
    expect(y4.hubCapitalSpendCrore).toBe(0.00);
    expect(y4.extraFarmerIncomeCrore).toBe(11.69);
  });
});

describe('M2 Acceptance Tests: Lifecycle, Ledger Balance, and Simulators', () => {
  it('Double-Entry Ledger balances (total debits equal total credits)', async () => {
    const entries = db.select().from(schema.ledgerEntries).all();
    const totalDebit = entries.reduce((sum, e) => sum + e.debitPaise, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.creditPaise, 0);

    expect(totalDebit).toBeGreaterThan(0);
    expect(totalCredit).toBeGreaterThan(0);
    expect(totalDebit).toBe(totalCredit);
  });

  it('Runs End-to-End Lot Lifecycle: Intake -> Decision -> Collective Load -> Payout Settle', async () => {
    // 1. Intake
    const intakeRes = await app.request('/api/hub/intake', {
      method: 'POST',
      body: JSON.stringify({
        farmerId: 'farmer_ramesh',
        crop: 'tomato',
        weightGrams: 150_000,
        quality: { blemishPercent: 4, firmness: 4, sizeClass: 'medium', ripeness: 'turning' },
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(intakeRes.status).toBe(200);
    const intakeJson = await intakeRes.json();
    const newLotId = intakeJson.lot.id;
    expect(intakeJson.lot.grade).toBe('A');

    // 2. Decision: Farmer taps SELL
    const decisionRes = await app.request(`/api/lots/${newLotId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ action: 'SELL' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(decisionRes.status).toBe(200);

    // 3. Build Collective Load
    const loadRes = await app.request('/api/hub/loads', {
      method: 'POST',
      body: JSON.stringify({
        buyerOrderId: 'order_kirana_500kg',
        lotIds: [newLotId],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(loadRes.status).toBe(200);
    const { loadId } = await loadRes.json();

    // 4. Confirm Sale & Dispatch
    const confirmRes = await app.request(`/api/hub/loads/${loadId}/confirm`, {
      method: 'POST',
    });
    expect(confirmRes.status).toBe(200);

    // Verify payout created with 24h SLA clock
    const payoutsRes = await app.request('/api/hub/payouts');
    const payoutsJson = await payoutsRes.json();
    const payout = payoutsJson.payouts.find((p: any) => p.lotId === newLotId);
    expect(payout).toBeDefined();
    expect(payout.status).toBe('pending');
    expect(payout.remainingHours).toBeGreaterThan(0);

    // 5. Settle Payout via Simulated UPI
    const settleRes = await app.request(`/api/hub/payouts/${payout.id}/settle`, {
      method: 'POST',
    });
    expect(settleRes.status).toBe(200);
    const settleJson = await settleRes.json();
    expect(settleJson.status).toBe('settled');
    expect(settleJson.transactionId).toContain('UPI-SIM');
  });

  it('WhatsApp Channel Simulator answers commands in farmer preferred language', async () => {
    // English PRICE command
    const resEn = await app.request('/api/channels/whatsapp/inbound', {
      method: 'POST',
      body: JSON.stringify({ farmerId: 'farmer_rajesh', messageText: 'PRICE' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const jsonEn = await resEn.json();
    expect(jsonEn.reply).toContain("Today's Tomato Mandi Price");

    // Tamil LOTS command
    const resTa = await app.request('/api/channels/whatsapp/inbound', {
      method: 'POST',
      body: JSON.stringify({ farmerId: 'farmer_meena', messageText: 'LOTS' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const jsonTa = await resTa.json();
    expect(jsonTa.reply).toContain('லாட் #214');
  });

  it('Public Traceability page respects DPDP Act consent', async () => {
    // Meena has opted IN to public traceability
    const resMeena = await app.request('/t/FGH-ANNUR-2026-LOT214');
    expect(resMeena.status).toBe(200);
    const jsonMeena = await resMeena.json();
    expect(jsonMeena.farmer.name).toBe('Meena');
    expect(jsonMeena.farmer.village).toBe('Annur');

    // Selvam has opted OUT (private)
    const intakeSelvam = await app.request('/api/hub/intake', {
      method: 'POST',
      body: JSON.stringify({
        farmerId: 'farmer_selvam',
        crop: 'tomato',
        weightGrams: 90_000,
        quality: { blemishPercent: 4, firmness: 4, sizeClass: 'medium', ripeness: 'turning' },
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const lotSelvam = (await intakeSelvam.json()).lot;
    const resSelvam = await app.request(`/t/${lotSelvam.qrCode}`);
    const jsonSelvam = await resSelvam.json();
    expect(jsonSelvam.farmer.name).toContain('Identity Protected');
  });
});
