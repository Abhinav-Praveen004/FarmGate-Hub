import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { paiseToRupees } from '@farmgate/shared';

export const receiptsRouter = new Hono();

receiptsRouter.get('/:lotId', async (c) => {
  const lotId = c.req.param('lotId');
  const receipt = db.select().from(schema.receipts).where(eq(schema.receipts.lotId, lotId)).get();
  if (!receipt) {
    return c.json({ error: 'Receipt not found for lot' }, 404);
  }

  // Waterfall breakdown in both Rupees and Paise
  const waterfall = {
    consumerPrice: {
      paisePerKg: receipt.consumerReferencePricePaisePerKg,
      rupeesPerKg: paiseToRupees(receipt.consumerReferencePricePaisePerKg),
      label: 'Consumer Reference Price',
    },
    transport: {
      paisePerKg: receipt.transportCostPaisePerKg,
      rupeesPerKg: paiseToRupees(receipt.transportCostPaisePerKg),
      label: 'Transport & Logistics',
    },
    handlingWastage: {
      paisePerKg: receipt.handlingWastagePaisePerKg,
      rupeesPerKg: paiseToRupees(receipt.handlingWastagePaisePerKg),
      label: 'Handling & Wastage Loss',
    },
    intermediaryMargin: {
      paisePerKg: receipt.intermediaryMarginPaisePerKg,
      rupeesPerKg: paiseToRupees(receipt.intermediaryMarginPaisePerKg),
      label: 'Retailer & Intermediary Margin',
    },
    farmerGross: {
      paisePerKg: receipt.farmerGrossPricePaisePerKg,
      rupeesPerKg: paiseToRupees(receipt.farmerGrossPricePaisePerKg),
      sharePercent: receipt.farmerSharePercent,
      label: 'Farmer Realised Price (45%)',
    },
    hubFee: {
      storagePaisePerKg: receipt.hubStorageFeePaisePerKg,
      commissionPaisePerKg: receipt.hubCommissionPaisePerKg,
      totalPaisePerKg: receipt.totalHubFeePaisePerKg,
      totalRupeesPerKg: paiseToRupees(receipt.totalHubFeePaisePerKg),
      label: 'FarmGate Hub Flat Fee + 3%',
    },
    farmerNet: {
      paisePerKg: receipt.netFarmerPricePaisePerKg,
      rupeesPerKg: paiseToRupees(receipt.netFarmerPricePaisePerKg),
      label: 'Net Transferred to Farmer',
    },
    typicalSharePercent: receipt.typicalSharePercent,
  };

  const ledgerSummary = {
    grossSaleRupees: paiseToRupees(receipt.grossSalePaise),
    totalFeesRupees: paiseToRupees(receipt.totalFeesPaise),
    advanceDeductedRupees: paiseToRupees(receipt.advanceDeductedPaise),
    netPaidRupees: paiseToRupees(receipt.netPaidPaise),
  };

  return c.json({
    ...receipt,
    waterfall,
    ledgerSummary,
    simulated: true,
  });
});
