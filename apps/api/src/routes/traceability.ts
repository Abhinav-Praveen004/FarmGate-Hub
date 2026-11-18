import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { gramsToKg } from '@farmgate/shared';

export const traceabilityRouter = new Hono();

traceabilityRouter.get('/:code', async (c) => {
  const code = c.req.param('code');
  const lot = db.select().from(schema.lots).where(eq(schema.lots.qrCode, code)).get();
  if (!lot) {
    return c.json({ error: 'Traceability record not found for code' }, 404);
  }

  const farmer = db.select().from(schema.farmers).where(eq(schema.farmers.id, lot.farmerId)).get();
  const quality = JSON.parse(lot.qualityJson);

  // DPDP privacy check
  let farmerDisplay = 'Verified FPO Member (Identity Protected)';
  let villageDisplay = 'Annur Cluster';
  if (farmer?.optInPublicTraceability) {
    farmerDisplay = farmer.name;
    villageDisplay = farmer.village;
  }

  return c.json({
    traceabilityCode: code,
    lotNumber: lot.lotNumber,
    crop: lot.crop,
    grade: lot.grade,
    weightKg: gramsToKg(lot.weightGrams),
    hubName: 'FarmGate Hub - Annur Cluster (FPO Partner)',
    receivedAt: lot.receivedAt,
    hoursInCoolPod: lot.hoursInPod,
    storageTemperatureRange: '10°C - 13°C (Solar Thermal Storage)',
    qualityReport: {
      blemishPercent: quality.blemishPercent,
      firmnessRating: `${quality.firmness}/5`,
      sizeClass: quality.sizeClass,
    },
    farmer: {
      name: farmerDisplay,
      village: villageDisplay,
      collective: 'Annur Farmers Producer Organisation',
    },
    status: lot.status,
    verified: true,
  });
});
