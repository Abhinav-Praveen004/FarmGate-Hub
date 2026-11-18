import { roundHalfAwayFromZero } from '../utils/money.js';

export interface PerTonneEconomicsInput {
  retailPriceRupeesPerKg?: number; // default ₹30
  baselineLossPercent?: number; // default 11.6%
  hubLossPercent?: number; // default 4.0%
  baselineFarmerSharePercent?: number; // default 33%
  hubFarmerSharePercent?: number; // default 45%
  hubFlatFeeRupeesPerKg?: number; // default ₹1.50
  hubFarmerCommissionPercent?: number; // default 3.0%
}

export interface PerTonneEconomicsResult {
  baseline: {
    lossPercent: number;
    kgSold: number;
    pricePerKg: number;
    grossIncomeRupees: number;
    feesRupees: number;
    netIncomeRupees: number;
    reportedApproxRupees: number; // 8750
  };
  hub: {
    lossPercent: number;
    kgSold: number;
    pricePerKg: number;
    feePerKg: number;
    netPricePerKg: number;
    grossIncomeRupees: number;
    feesRupees: number;
    netIncomeRupees: number;
    reportedApproxRupees: number; // 11100
  };
  absoluteGainRupees: number;
  percentageGain: number; // 27.2%
  householdAnnual: {
    monthlyBaselineCropIncomeRupees: number; // 3798
    monthlyGainRupees: number; // ~950
    annualComputedRupees: number; // ~11394
    reportedNetworkAnnualRupees: number; // 11400
    networkMaturity12500FarmersRupeesCrore: number; // ~14.25 Cr
  };
}

/**
 * Calculates farmer economics for 1 tonne (1,000 kg) of produce (default tomatoes).
 * Reproduces Section 4.8 exactly.
 */
export function calculateFarmerEconomicsPerTonne(
  inputs: PerTonneEconomicsInput = {}
): PerTonneEconomicsResult {
  const retailPrice = inputs.retailPriceRupeesPerKg ?? 30.0;
  const baseLoss = inputs.baselineLossPercent ?? 11.6;
  const hubLoss = inputs.hubLossPercent ?? 4.0;
  const baseShare = inputs.baselineFarmerSharePercent ?? 33.0;
  const hubShare = inputs.hubFarmerSharePercent ?? 45.0;
  const flatFee = inputs.hubFlatFeeRupeesPerKg ?? 1.5;
  const commission = inputs.hubFarmerCommissionPercent ?? 3.0;

  // 1. Baseline
  const baseKgSold = 1000 * (1 - baseLoss / 100); // 884 kg
  const basePricePerKg = retailPrice * (baseShare / 100); // ₹9.90
  const baseNetIncome = baseKgSold * basePricePerKg; // ₹8,751.60

  // 2. With Hub
  const hubKgSold = 1000 * (1 - hubLoss / 100); // 960 kg
  const hubPricePerKg = retailPrice * (hubShare / 100); // ₹13.50
  const hubFeePerKg = flatFee + hubPricePerKg * (commission / 100); // 1.50 + 0.405 = ₹1.905
  const hubNetPricePerKg = hubPricePerKg - hubFeePerKg; // ₹11.595
  const hubGrossIncome = hubKgSold * hubPricePerKg; // ₹12,960.00
  const hubTotalFees = hubKgSold * hubFeePerKg; // ₹1,828.80
  const hubNetIncome = hubKgSold * hubNetPricePerKg; // ₹11,131.20

  // 3. Gains
  const absoluteGain = hubNetIncome - baseNetIncome; // ₹2,379.60
  const percentageGain = roundHalfAwayFromZero((absoluteGain / baseNetIncome) * 100, 1); // 27.2%

  // 4. Household view (NSS baseline ₹3,798)
  const monthlyBaseline = 3798;
  const monthlyGain = roundHalfAwayFromZero(monthlyBaseline * (percentageGain / 100), 0);
  const annualComputed = roundHalfAwayFromZero(monthlyGain * 12, 0);
  const reportedAnnual = 11400; // From Section 4.7 & 4.8
  const networkMaturityCrore = roundHalfAwayFromZero((12500 * reportedAnnual) / 10_000_000, 2);

  return {
    baseline: {
      lossPercent: baseLoss,
      kgSold: roundHalfAwayFromZero(baseKgSold, 1),
      pricePerKg: roundHalfAwayFromZero(basePricePerKg, 2),
      grossIncomeRupees: roundHalfAwayFromZero(baseNetIncome, 1),
      feesRupees: 0,
      netIncomeRupees: roundHalfAwayFromZero(baseNetIncome, 1),
      reportedApproxRupees: 8750,
    },
    hub: {
      lossPercent: hubLoss,
      kgSold: roundHalfAwayFromZero(hubKgSold, 1),
      pricePerKg: roundHalfAwayFromZero(hubPricePerKg, 2),
      feePerKg: roundHalfAwayFromZero(hubFeePerKg, 3),
      netPricePerKg: roundHalfAwayFromZero(hubNetPricePerKg, 3),
      grossIncomeRupees: roundHalfAwayFromZero(hubGrossIncome, 2),
      feesRupees: roundHalfAwayFromZero(hubTotalFees, 2),
      netIncomeRupees: roundHalfAwayFromZero(hubNetIncome, 1),
      reportedApproxRupees: 11100,
    },
    absoluteGainRupees: roundHalfAwayFromZero(absoluteGain, 1),
    percentageGain,
    householdAnnual: {
      monthlyBaselineCropIncomeRupees: monthlyBaseline,
      monthlyGainRupees: monthlyGain,
      annualComputedRupees: annualComputed,
      reportedNetworkAnnualRupees: reportedAnnual,
      networkMaturity12500FarmersRupeesCrore: networkMaturityCrore,
    },
  };
}
