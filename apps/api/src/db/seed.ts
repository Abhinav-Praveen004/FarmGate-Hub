import { db, sqlite, initSchema } from './index.js';
import * as schema from './schema.js';
import {
  SEED_FARMERS,
  SEED_BUYERS,
  SEED_BUYER_ORDERS,
  SEED_LOT_214,
  SEED_LOT_198,
  SEED_RECEIPT_198,
  SEED_POD_TELEMETRY,
} from '@farmgate/shared';

export function runSeed(customDb = db, customSqlite = sqlite) {
  initSchema(customSqlite);

  // Clear tables for deterministic idempotent seed
  customSqlite.exec(`
    DELETE FROM channel_messages;
    DELETE FROM pod_telemetry;
    DELETE FROM ledger_entries;
    DELETE FROM receipts;
    DELETE FROM payouts;
    DELETE FROM advances;
    DELETE FROM collective_loads;
    DELETE FROM buyer_orders;
    DELETE FROM lots;
    DELETE FROM mandi_prices;
    DELETE FROM crops;
    DELETE FROM buyers;
    DELETE FROM farmers;
  `);

  // 1. Seed Crops
  customDb.insert(schema.crops).values([
    {
      name: 'tomato',
      floorPricePaisePerKg: 1100, // ₹11.0
      baselineMandiPricePaisePerKg: 900, // ₹9.0
      retailReferencePricePaisePerKg: 3000, // ₹30.0
    },
    {
      name: 'onion',
      floorPricePaisePerKg: 1800,
      baselineMandiPricePaisePerKg: 1500,
      retailReferencePricePaisePerKg: 4200,
    },
    {
      name: 'potato',
      floorPricePaisePerKg: 1400,
      baselineMandiPricePaisePerKg: 1200,
      retailReferencePricePaisePerKg: 3500,
    },
    {
      name: 'banana',
      floorPricePaisePerKg: 1600,
      baselineMandiPricePaisePerKg: 1300,
      retailReferencePricePaisePerKg: 4000,
    },
    {
      name: 'mango',
      floorPricePaisePerKg: 4500,
      baselineMandiPricePaisePerKg: 3800,
      retailReferencePricePaisePerKg: 9000,
    },
  ]).run();

  // 2. Seed 14-day Mandi Price History for Tomato
  const basePrices = [1200, 1150, 1100, 1050, 1000, 950, 920, 900, 880, 890, 910, 930, 910, 900];
  const mandiEntries = basePrices.map((price, idx) => ({
    id: `mandi_tom_${idx + 1}`,
    crop: 'tomato',
    date: `2026-11-${String(5 + idx).padStart(2, '0')}`,
    pricePaisePerKg: price,
  }));
  customDb.insert(schema.mandiPrices).values(mandiEntries).run();

  // 3. Seed 12 Farmers (Primary + demo cluster)
  const fullFarmers = [
    ...SEED_FARMERS,
    {
      id: 'farmer_anand',
      name: 'Anand V',
      village: 'Annur',
      phone: '+91 00000 00014',
      upiId: 'anand@demo',
      preferredLanguage: 'ta',
      preferredChannel: 'app',
      optInPublicTraceability: true,
    },
    {
      id: 'farmer_deepa',
      name: 'Deepa M',
      village: 'Kariyampalayam',
      phone: '+91 00000 00015',
      upiId: 'deepa@demo',
      preferredLanguage: 'ta',
      preferredChannel: 'whatsapp',
      optInPublicTraceability: true,
    },
    {
      id: 'farmer_kavita',
      name: 'Kavita Devi',
      village: 'Annur East',
      phone: '+91 00000 00016',
      upiId: 'kavita@demo',
      preferredLanguage: 'hi',
      preferredChannel: 'app',
      optInPublicTraceability: true,
    },
    {
      id: 'farmer_rajesh',
      name: 'Rajesh G',
      village: 'Myleripalayam',
      phone: '+91 00000 00017',
      upiId: 'rajesh@demo',
      preferredLanguage: 'en',
      preferredChannel: 'app',
      optInPublicTraceability: false,
    },
    {
      id: 'farmer_suresh',
      name: 'Suresh B',
      village: 'Annur North',
      phone: '+91 00000 00018',
      upiId: 'suresh@demo',
      preferredLanguage: 'ta',
      preferredChannel: 'voice',
      optInPublicTraceability: true,
    },
    {
      id: 'farmer_lakshmi',
      name: 'Lakshmi K',
      village: 'Kariyampalayam',
      phone: '+91 00000 00019',
      upiId: 'lakshmi@demo',
      preferredLanguage: 'ta',
      preferredChannel: 'app',
      optInPublicTraceability: true,
    },
    {
      id: 'farmer_arun',
      name: 'Arun Kumar',
      village: 'Annur West',
      phone: '+91 00000 00020',
      upiId: 'arun@demo',
      preferredLanguage: 'hi',
      preferredChannel: 'whatsapp',
      optInPublicTraceability: true,
    },
    {
      id: 'farmer_murugan',
      name: 'Murugan S',
      village: 'Annur Cluster',
      phone: '+91 00000 00024',
      upiId: 'murugan@demo',
      preferredLanguage: 'ta',
      preferredChannel: 'voice',
      optInPublicTraceability: true,
    },
    {
      id: 'farmer_geetha',
      name: 'Geetha R',
      village: 'Annur',
      phone: '+91 00000 00025',
      upiId: 'geetha@demo',
      preferredLanguage: 'ta',
      preferredChannel: 'app',
      optInPublicTraceability: true,
    },
  ];
  customDb.insert(schema.farmers).values(fullFarmers).run();

  // 4. Seed Buyers & Processor
  const fullBuyers = [
    ...SEED_BUYERS,
    {
      id: 'buyer_grade_c_processor',
      name: 'Golden Harvest Food Processors',
      type: 'processor',
      phone: '+91 00000 00030',
      reliabilityScore: 98,
    },
  ];
  customDb.insert(schema.buyers).values(fullBuyers).run();

  // 5. Seed Buyer Orders
  customDb.insert(schema.buyerOrders).values(SEED_BUYER_ORDERS).run();

  // 6. Seed Lots (including Lot #214 and Lot #198)
  const { quality: _q214, timeline: _t214, ...lot214Base } = SEED_LOT_214;
  const { quality: _q198, timeline: _t198, ...lot198Base } = SEED_LOT_198;

  const lotRows = [
    {
      ...lot214Base,
      qualityJson: JSON.stringify(SEED_LOT_214.quality),
      timelineJson: JSON.stringify(SEED_LOT_214.timeline),
    },
    {
      ...lot198Base,
      qualityJson: JSON.stringify(SEED_LOT_198.quality),
      timelineJson: JSON.stringify(SEED_LOT_198.timeline),
    },
  ];

  // Additional lots across cluster to simulate full pod and collective loading (~40 lots)
  const otherCrops = ['tomato', 'onion', 'potato', 'banana', 'mango'] as const;
  const grades = ['A', 'B', 'C'] as const;
  const statuses = ['in_pod', 'in_pod', 'graded', 'sold', 'dispatched'] as const;

  for (let i = 215; i <= 250; i++) {
    const c = otherCrops[i % otherCrops.length];
    const g = grades[i % grades.length];
    const s = statuses[i % statuses.length];
    const f = fullFarmers[i % fullFarmers.length];
    const weight = 80_000 + (i % 10) * 15_000;
    const hours = (i * 3) % 48;

    lotRows.push({
      id: `lot_${i}`,
      lotNumber: i,
      farmerId: f.id,
      crop: c,
      weightGrams: weight,
      grade: g,
      status: s,
      intakePriceEstimatePaise: 1200 + (i % 5) * 100,
      finalSalePricePaisePerKg: s === 'sold' || s === 'dispatched' ? 1350 : undefined,
      holdingLimitHours: 72,
      receivedAt: new Date(Date.now() - hours * 3600 * 1000).toISOString(),
      soldAt: s === 'sold' || s === 'dispatched' ? new Date().toISOString() : undefined,
      hoursInPod: hours,
      qrCode: `FGH-ANNUR-2026-LOT${i}`,
      qualityJson: JSON.stringify({
        blemishPercent: g === 'A' ? 3 : g === 'B' ? 10 : 20,
        firmness: g === 'A' ? 4 : g === 'B' ? 3 : 2,
        sizeClass: 'medium',
        ripeness: 'turning',
      }),
      timelineJson: JSON.stringify([
        {
          timestamp: new Date(Date.now() - hours * 3600 * 1000).toISOString(),
          status: 'received',
          actor: 'Ravi (Hub Operator)',
          note: `Received ${weight / 1000} kg of ${c}`,
        },
      ]),
      advanceRequested: i % 4 === 0,
      advanceSettled: i % 4 === 0 && s === 'sold',
    });
  }

  customDb.insert(schema.lots).values(lotRows).run();

  // 7. Seed Receipt for Lot #198 (Screen 3)
  customDb.insert(schema.receipts).values(SEED_RECEIPT_198).run();

  // 8. Seed Payout for Lot #198
  customDb.insert(schema.payouts).values({
    id: 'pay_198',
    lotId: 'lot_198',
    farmerId: 'farmer_meena',
    grossAmountPaise: 135_000,
    feeDeductedPaise: 19_050,
    advanceRecoveredPaise: 0,
    netPaidPaise: 115_950,
    dueAt: '2026-11-17T10:00:00Z',
    paidAt: '2026-11-16T14:30:00Z',
    status: 'settled',
    upiTransactionId: 'UPI-SIM-198-SETTLED',
  }).run();

  // 9. Seed Advance on Lot #214
  customDb.insert(schema.advances).values({
    id: 'adv_214',
    lotId: 'lot_214',
    farmerId: 'farmer_meena',
    requestedAmountPaise: 72_000, // ₹720 (60% on ₹10 bid baseline)
    approvedAmountPaise: 72_000,
    status: 'approved',
    requestedAt: '2026-11-17T16:30:00Z',
  }).run();

  // 10. Seed Double-Entry Ledger (balanced)
  customDb.insert(schema.ledgerEntries).values([
    {
      id: 'led_1',
      transactionType: 'buyer_payment',
      debitPaise: 0,
      creditPaise: 135_000, // Buyer paid ₹1,350
      referenceLotId: 'lot_198',
      note: 'Annapurna Kirana Network settlement for Lot #198',
      createdAt: '2026-11-16T10:30:00Z',
    },
    {
      id: 'led_2',
      transactionType: 'farmer_payable',
      debitPaise: 115_950, // Paid to farmer ₹1,159.50
      creditPaise: 0,
      referenceLotId: 'lot_198',
      note: 'Net payout to Meena via UPI',
      createdAt: '2026-11-16T14:30:00Z',
    },
    {
      id: 'led_3',
      transactionType: 'hub_fee',
      debitPaise: 19_050, // Hub storage & commission ₹190.50
      creditPaise: 0,
      referenceLotId: 'lot_198',
      note: 'Hub revenue retained',
      createdAt: '2026-11-16T14:30:00Z',
    },
  ]).run();

  // 11. Seed Pod Telemetry
  customDb.insert(schema.podTelemetry).values({
    id: 'pod_annur_1',
    ...SEED_POD_TELEMETRY,
  }).run();

  // 12. Seed Channel Message (WhatsApp welcome / alert for Meena)
  customDb.insert(schema.channelMessages).values([
    {
      id: 'msg_1',
      farmerId: 'farmer_meena',
      channel: 'whatsapp',
      direction: 'outbound',
      messageText: 'Lot 214 received: 120 kg, Grade A. In cool pod. Best buyer bid ₹14/kg is above floor. Tap app to decide: SELL or HOLD.',
      timestamp: '2026-11-17T16:25:00Z',
    },
  ]).run();

  return { success: true, seededLots: lotRows.length };
}

// Auto-run if executed directly via CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('Seeding FarmGate Hub SQLite database...');
  const res = runSeed();
  console.log(`Seeding complete: ${res.seededLots} lots populated.`);
}
