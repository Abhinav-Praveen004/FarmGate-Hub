import { Hono } from 'hono';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { paiseToRupees } from '@farmgate/shared';

export const receiptsRouter = new Hono();

function buildReceiptPayload(receipt: any) {
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

  return {
    ...receipt,
    waterfall,
    ledgerSummary,
    simulated: true,
  };
}

const handleGetReceipt = async (c: any) => {
  const rawId = c.req.param('lotId');
  const normalizedLotId = rawId.toLowerCase().replace(/^(lot[-_]?)/, 'lot_');
  const rawLotNumber = parseInt(rawId.replace(/\D/g, ''), 10);

  // 1. Try finding in receipts table
  let receipt = db
    .select()
    .from(schema.receipts)
    .where(
      or(
        eq(schema.receipts.lotId, rawId),
        eq(schema.receipts.lotId, normalizedLotId),
        eq(schema.receipts.id, rawId)
      )
    )
    .get();

  if (receipt) {
    return c.json(buildReceiptPayload(receipt));
  }

  // 2. If not in receipts, look up the lot in lots table
  const lot = db
    .select()
    .from(schema.lots)
    .where(
      or(
        eq(schema.lots.id, rawId),
        eq(schema.lots.id, normalizedLotId),
        !isNaN(rawLotNumber) ? eq(schema.lots.lotNumber, rawLotNumber) : undefined
      )
    )
    .get();

  if (lot) {
    const weightKg = (lot.weightGrams || 100000) / 1000;
    const consumerPricePaise = 3000; // ₹30/kg baseline
    const farmerGrossPaise = Math.round(consumerPricePaise * 0.45); // 45% = ₹13.50
    const hubStorageFeePaise = 150; // ₹1.50
    const hubCommissionPaise = Math.round(farmerGrossPaise * 0.03); // 3%
    const totalHubFeePaise = hubStorageFeePaise + hubCommissionPaise;
    const netFarmerPricePaise = farmerGrossPaise - totalHubFeePaise;

    const grossSalePaise = Math.round(farmerGrossPaise * weightKg);
    const totalFeesPaise = Math.round(totalHubFeePaise * weightKg);
    const advanceDeductedPaise = lot.advanceSettled ? Math.round(grossSalePaise * 0.4) : 0;
    const netPaidPaise = grossSalePaise - totalFeesPaise - advanceDeductedPaise;

    const syntheticReceipt = {
      id: `rec_${lot.lotNumber}`,
      lotId: lot.id,
      farmerName: 'Ramesh Chandra',
      crop: lot.crop,
      weightKg,
      consumerReferencePricePaisePerKg: consumerPricePaise,
      transportCostPaisePerKg: 300,
      handlingWastagePaisePerKg: 350,
      intermediaryMarginPaisePerKg: 1000,
      farmerGrossPricePaisePerKg: farmerGrossPaise,
      farmerSharePercent: 45,
      hubStorageFeePaisePerKg: hubStorageFeePaise,
      hubCommissionPaisePerKg: hubCommissionPaise,
      totalHubFeePaisePerKg: totalHubFeePaise,
      netFarmerPricePaisePerKg: netFarmerPricePaise,
      grossSalePaise,
      totalFeesPaise,
      advanceDeductedPaise,
      netPaidPaise,
      typicalSharePercent: 33,
      issuedAt: lot.soldAt || new Date().toISOString(),
    };

    return c.json(buildReceiptPayload(syntheticReceipt));
  }

  return c.json({ error: 'Receipt not found for lot' }, 404);
};

receiptsRouter.get('/lot/:lotId', handleGetReceipt);
receiptsRouter.get('/:lotId', handleGetReceipt);

