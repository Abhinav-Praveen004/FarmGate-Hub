import { describe, it, expect } from 'vitest';
import {
  paiseToRupees,
  rupeesToPaise,
  gramsToKg,
  kgToGrams,
  roundHalfAwayFromZero,
  calculateFarmerFeePaisePerKg,
} from '../src/utils/money.js';
import {
  formatINR,
  formatRatePerKg,
  formatWeightKg,
  formatLakhCrore,
  formatCroreDisplay,
} from '../src/utils/formatters.js';
import { SEED_RECEIPT_198 } from '../src/fixtures/seed.js';

describe('Money and Weight Utilities', () => {
  it('converts correctly between paise and rupees', () => {
    expect(paiseToRupees(1350)).toBe(13.5);
    expect(rupeesToPaise(13.5)).toBe(1350);
    expect(rupeesToPaise(1.905)).toBe(191);
  });

  it('converts correctly between grams and kilograms', () => {
    expect(gramsToKg(120000)).toBe(120);
    expect(kgToGrams(120.5)).toBe(120500);
  });

  it('implements roundHalfAwayFromZero', () => {
    expect(roundHalfAwayFromZero(-0.855, 2)).toBe(-0.86);
    expect(roundHalfAwayFromZero(0.855, 2)).toBe(0.86);
    expect(roundHalfAwayFromZero(-1.355, 2)).toBe(-1.36);
    expect(roundHalfAwayFromZero(-1.445, 2)).toBe(-1.45);
    expect(roundHalfAwayFromZero(11.685, 2)).toBe(11.69);
  });

  it('calculates farmer fee complying with ₹1.50 flat + 3% commission', () => {
    // For sale price ₹13.50/kg (1350 paise)
    // 150 paise + round(1350 * 0.03) = 150 + 41 = 191 paise (₹1.91)
    const feePaise = calculateFarmerFeePaisePerKg(1350);
    expect(feePaise).toBe(191);
    expect(paiseToRupees(feePaise)).toBeCloseTo(1.91, 2);
  });
});

describe('Formatters', () => {
  it('formats INR using en-IN grouping and ₹ symbol', () => {
    expect(formatINR(1021800)).toBe('₹10,218');
    expect(formatINR(1113120)).toBe('₹11,131');
    expect(formatRatePerKg(1350, 1)).toBe('₹13.5/kg');
    expect(formatRatePerKg(900, 0)).toBe('₹9/kg');
    expect(formatWeightKg(120000)).toBe('120.0 kg');
  });

  it('formats lakh and crore amounts accurately', () => {
    expect(formatLakhCrore(2500000)).toBe('₹25.0 Lakh');
    expect(formatLakhCrore(50000000)).toBe('₹5.00 Cr');
    expect(formatCroreDisplay(-0.855)).toBe('-₹0.86 Cr');
    expect(formatCroreDisplay(2.1, { includeSign: true })).toBe('+₹2.10 Cr');
  });
});

describe('M1 Golden Test: Screen 3 & Lot #198 Receipt Reconciliation', () => {
  it('reproduces Screen 3 exactly with non-farmer waterfall breakdown', () => {
    const rec = SEED_RECEIPT_198;

    // Consumer paid ₹30.00/kg
    expect(rec.consumerReferencePricePaisePerKg).toBe(3000);

    // Farmer gross received: ₹13.50/kg (45%)
    expect(rec.farmerGrossPricePaisePerKg).toBe(1350);
    expect(rec.farmerSharePercent).toBe(45);

    // Hub fee check: ₹1.905 shown as ₹1.9/kg (191 paise)
    const feePerKg = rec.totalHubFeePaisePerKg / 100;
    expect(roundHalfAwayFromZero(feePerKg, 1)).toBe(1.9);

    // Net paid to farmer: ₹13.50 - ₹1.905 = ₹11.595, shown as ₹11.6/kg
    const netPerKg = rec.netFarmerPricePaisePerKg / 100;
    expect(roundHalfAwayFromZero(netPerKg, 1)).toBe(11.6);

    // Non-farmer total: 30.00 - 13.50 = 16.50
    const nonFarmerSumPaise =
      rec.transportCostPaisePerKg +
      rec.handlingWastagePaisePerKg +
      rec.intermediaryMarginPaisePerKg;
    expect(nonFarmerSumPaise).toBe(1650); // ₹3.00 + ₹3.50 + ₹10.00 = ₹16.50
    expect(rec.farmerGrossPricePaisePerKg + nonFarmerSumPaise).toBe(rec.consumerReferencePricePaisePerKg);

    // Lot ledger totals (100 kg lot)
    expect(rec.grossSalePaise).toBe(135000); // ₹1,350.00
    expect(rec.netPaidPaise).toBe(115950); // ₹1,159.50
    expect(rec.typicalSharePercent).toBe(33);
  });
});
