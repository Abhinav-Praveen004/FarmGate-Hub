import { roundHalfAwayFromZero } from '../utils/money.js';

export interface SensitivityInput {
  volumeFactor?: number; // 0.5 to 1.5 (default 1.0)
  averageRealisedPriceRupees?: number; // ₹15 to ₹35 (default ₹25)
  adoptionSpeedFactor?: number; // 0.5 to 1.5 (default 1.0)
}

export interface SensitivityResult {
  year4RevenueCrore: number;
  year4EbitdaCrore: number;
  year4EbitdaMarginPercent: number;
  paybackYears: number;
  isBaseline: boolean;
}

/**
 * Recomputes Year 4 network economics and payback based on sensitivity parameters.
 */
export function calculateSensitivity(input: SensitivityInput = {}): SensitivityResult {
  const volFactor = input.volumeFactor ?? 1.0;
  const avgPrice = input.averageRealisedPriceRupees ?? 25.0;
  const adoptFactor = input.adoptionSpeedFactor ?? 1.0;

  // Base Year 4: 38,000 tonnes produce handled across 25 hubs
  // Revenue = tonnes * (₹1.50 + 5% of price)/100,000 lakh + other income
  // Other income across cohorts in Year 4 = 3*6 + 7*6 + 15*3 = 105.0 Lakh (₹1.05 Cr)
  const adjustedTonnes = 38000 * volFactor * adoptFactor;
  const revPerKg = 1.5 + 0.05 * avgPrice; // at ₹25, ₹2.75/kg
  const feeRevenueLakh = adjustedTonnes * (revPerKg / 100);
  const otherIncomeLakh = 105.0; // Fixed derived other income (₹1.05 Cr)
  const totalRevenueCrore = (feeRevenueLakh + otherIncomeLakh) / 100;

  // Year 4 Hub Operating Cost remains fixed at ₹7.40 Crore; Central cost at ₹2.00 Crore
  const hubOperatingCostCrore = 7.4;
  const centralCostCrore = 2.0;

  const ebitdaCrore = totalRevenueCrore - hubOperatingCostCrore - centralCostCrore;
  const ebitdaMargin =
    totalRevenueCrore > 0 ? (ebitdaCrore / totalRevenueCrore) * 100 : 0;

  // Payback estimation based on single hub Year 1-3 surplus with volume and price factors
  // Standard hub capital is ₹25 Lakh. Cumulative 3-year surplus base is ₹28.5 Lakh.
  const adjustedSurplusLakh = 28.5 * volFactor * (revPerKg / 2.75);
  let paybackYears = 3.0;
  if (adjustedSurplusLakh > 0) {
    paybackYears = roundHalfAwayFromZero((25.0 / adjustedSurplusLakh) * 3, 1);
  } else {
    paybackYears = 10.0;
  }

  const isBaseline =
    Math.abs(volFactor - 1.0) < 0.001 &&
    Math.abs(avgPrice - 25.0) < 0.001 &&
    Math.abs(adoptFactor - 1.0) < 0.001;

  return {
    year4RevenueCrore: roundHalfAwayFromZero(totalRevenueCrore, 2),
    year4EbitdaCrore: roundHalfAwayFromZero(ebitdaCrore, 2),
    year4EbitdaMarginPercent: roundHalfAwayFromZero(ebitdaMargin, 0),
    paybackYears,
    isBaseline,
  };
}
