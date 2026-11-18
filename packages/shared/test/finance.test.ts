import { describe, it, expect } from 'vitest';
import {
  calculateFarmerEconomicsPerTonne,
  getHubYearMetrics,
  calculateHubPayback,
  calculateNetworkModel,
  calculateFundingAndMarket,
  calculateSensitivity,
  HUB_CAPITAL_LAKH,
  EXTRA_FARMER_INCOME_PER_FARMER_RUPEES,
} from '../src/finance/index.js';

describe('M1 Golden Tests: Section 4.6 - Single Hub Over Time', () => {
  it('reproduces Year 1 metrics', () => {
    const y1 = getHubYearMetrics(1);
    expect(y1.farmers).toBe(200);
    expect(y1.tonnes).toBe(600);
    expect(y1.revenueLakh).toBe(17.5);
    expect(y1.operatingCostLakh).toBe(26.0);
    expect(y1.surplusLakh).toBe(-8.5);
  });

  it('reproduces Year 2 metrics', () => {
    const y2 = getHubYearMetrics(2);
    expect(y2.farmers).toBe(350);
    expect(y2.tonnes).toBe(1200);
    expect(y2.revenueLakh).toBe(36.0);
    expect(y2.operatingCostLakh).toBe(28.0);
    expect(y2.surplusLakh).toBe(8.0);
  });

  it('reproduces Year 3 metrics', () => {
    const y3 = getHubYearMetrics(3);
    expect(y3.farmers).toBe(500);
    expect(y3.tonnes).toBe(2000);
    expect(y3.revenueLakh).toBe(61.0);
    expect(y3.operatingCostLakh).toBe(32.0);
    expect(y3.surplusLakh).toBe(29.0);
  });

  it('reproduces 3-year cumulative surplus and capital payback', () => {
    const payback = calculateHubPayback();
    expect(payback.capitalRequiredLakh).toBe(HUB_CAPITAL_LAKH); // ₹25 Lakh
    expect(payback.cumulativeSurplusAfterYear3Lakh).toBe(28.5); // -8.5 + 8.0 + 29.0 = 28.5 Lakh
    expect(payback.cumulativeSurplusAfterYear3Lakh).toBeGreaterThan(payback.capitalRequiredLakh);
    expect(payback.paybackYears).toBe(3.0);
  });

  it('Year 4 repeats Year 3 as per engineering assumption', () => {
    const y4 = getHubYearMetrics(4);
    expect(y4.farmers).toBe(500);
    expect(y4.tonnes).toBe(2000);
    expect(y4.revenueLakh).toBe(61.0);
    expect(y4.operatingCostLakh).toBe(32.0);
    expect(y4.surplusLakh).toBe(29.0);
  });
});

describe('M1 Golden Tests: Section 4.7 - Network Model (₹ Crore)', () => {
  const model = calculateNetworkModel();

  it('reproduces all Year 1 network values exactly', () => {
    const y1 = model[0];
    expect(y1.year).toBe(1);
    expect(y1.hubsLive).toBe(3);
    expect(y1.farmersServed).toBe(600);
    expect(y1.produceHandledTonnes).toBe(1800);
    expect(y1.revenueCrore).toBe(0.53); // 52.5 lakh = 0.525 -> 0.53
    expect(y1.hubOperatingCostCrore).toBe(0.78); // 78 lakh
    expect(y1.centralCostCrore).toBe(0.6);
    expect(y1.ebitdaCrore).toBe(-0.86); // -0.855 -> -0.86
    expect(y1.hubCapitalSpendCrore).toBe(0.75); // 3 * 25 lakh
    expect(y1.extraFarmerIncomeCrore).toBe(0.68); // 600 * 11400 = 0.684 -> 0.68
  });

  it('reproduces all Year 2 network values exactly', () => {
    const y2 = model[1];
    expect(y2.year).toBe(2);
    expect(y2.hubsLive).toBe(10);
    expect(y2.farmersServed).toBe(2450);
    expect(y2.produceHandledTonnes).toBe(7800);
    expect(y2.revenueCrore).toBe(2.31); // 230.5 lakh = 2.305 -> 2.31
    expect(y2.hubOperatingCostCrore).toBe(2.66); // 266 lakh
    expect(y2.centralCostCrore).toBe(1.0);
    expect(y2.ebitdaCrore).toBe(-1.36); // -1.355 -> -1.36
    expect(y2.hubCapitalSpendCrore).toBe(1.75); // 7 * 25 lakh
    expect(y2.extraFarmerIncomeCrore).toBe(2.79); // 2450 * 11400 = 2.793 -> 2.79
  });

  it('reproduces all Year 3 network values exactly', () => {
    const y3 = model[2];
    expect(y3.year).toBe(3);
    expect(y3.hubsLive).toBe(25);
    expect(y3.farmersServed).toBe(6950);
    expect(y3.produceHandledTonnes).toBe(23400);
    expect(y3.revenueCrore).toBe(6.98); // 697.5 lakh = 6.975 -> 6.98
    expect(y3.hubOperatingCostCrore).toBe(6.82); // 682 lakh
    expect(y3.centralCostCrore).toBe(1.6);
    expect(y3.ebitdaCrore).toBe(-1.45); // -1.445 -> -1.45
    expect(y3.hubCapitalSpendCrore).toBe(3.75); // 15 * 25 lakh
    expect(y3.extraFarmerIncomeCrore).toBe(7.92); // 6950 * 11400 = 7.923 -> 7.92
  });

  it('reproduces all Year 4 network values exactly', () => {
    const y4 = model[3];
    expect(y4.year).toBe(4);
    expect(y4.hubsLive).toBe(25);
    expect(y4.farmersServed).toBe(10250);
    expect(y4.produceHandledTonnes).toBe(38000);
    expect(y4.revenueCrore).toBe(11.5); // 1150 lakh
    expect(y4.hubOperatingCostCrore).toBe(7.4); // 740 lakh
    expect(y4.centralCostCrore).toBe(2.0);
    expect(y4.ebitdaCrore).toBe(2.1); // +2.10 (18%)
    expect(y4.ebitdaMarginPercent).toBe(18);
    expect(y4.hubCapitalSpendCrore).toBe(0.0);
    expect(y4.extraFarmerIncomeCrore).toBe(11.69); // 10250 * 11400 = 11.685 -> 11.69
  });

  it('confirms the ~₹1 extra farmer income per ₹1 company revenue in Year 4', () => {
    const y4 = model[3];
    const ratio = y4.extraFarmerIncomeCrore / y4.revenueCrore; // 11.69 / 11.50 = 1.016
    expect(ratio).toBeCloseTo(1.0, 1);
  });
});

describe('M1 Golden Tests: Section 4.8 - Farmer Economics Per Tonne', () => {
  const econ = calculateFarmerEconomicsPerTonne();

  it('calculates baseline tomato economics accurately', () => {
    expect(econ.baseline.lossPercent).toBe(11.6);
    expect(econ.baseline.kgSold).toBe(884);
    expect(econ.baseline.pricePerKg).toBe(9.9);
    expect(econ.baseline.netIncomeRupees).toBe(8751.6);
    expect(econ.baseline.reportedApproxRupees).toBe(8750);
    expect(Math.abs(econ.baseline.netIncomeRupees - 8750)).toBeLessThan(50);
  });

  it('calculates with-hub tomato economics accurately', () => {
    expect(econ.hub.lossPercent).toBe(4.0);
    expect(econ.hub.kgSold).toBe(960);
    expect(econ.hub.pricePerKg).toBe(13.5);
    expect(econ.hub.feePerKg).toBe(1.905);
    expect(econ.hub.netPricePerKg).toBe(11.595);
    expect(econ.hub.netIncomeRupees).toBe(11131.2);
    expect(econ.hub.reportedApproxRupees).toBe(11100);
    expect(Math.abs(econ.hub.netIncomeRupees - 11100)).toBeLessThan(50);
  });

  it('confirms uplift gain is ~27.2%', () => {
    expect(econ.percentageGain).toBe(27.2);
    expect(econ.absoluteGainRupees).toBe(2379.6);
  });

  it('reconciles annual household income gain', () => {
    expect(econ.householdAnnual.monthlyBaselineCropIncomeRupees).toBe(3798);
    expect(econ.householdAnnual.reportedNetworkAnnualRupees).toBe(EXTRA_FARMER_INCOME_PER_FARMER_RUPEES); // 11400
    expect(econ.householdAnnual.networkMaturity12500FarmersRupeesCrore).toBe(14.25); // ~14 Cr
  });
});

describe('M1 Golden Tests: Section 4.9 - Funding & Market Sizing', () => {
  const fm = calculateFundingAndMarket();

  it('sums seed use of funds to exactly ₹5.0 Crore', () => {
    expect(fm.seedAskCrore).toBe(5.0);
    expect(fm.totalAllocatedCrore).toBe(5.0);
    expect(fm.useOfFunds).toHaveLength(4);
  });

  it('calculates TAM, SAM, and SOM as specified', () => {
    expect(fm.tam.amountCrore).toBe(38600); // 19.3 Mt * ₹20/kg
    expect(fm.sam.amountCrore).toBe(610); // 1000 hubs * 0.61 Cr
    expect(fm.som.amountCrore).toBe(6.98); // 25 hubs Y3 revenue
  });
});

describe('Sensitivity Analysis', () => {
  it('returns baseline values at default multipliers', () => {
    const res = calculateSensitivity();
    expect(res.isBaseline).toBe(true);
    expect(res.year4RevenueCrore).toBe(11.5);
    expect(res.year4EbitdaCrore).toBe(2.1);
    expect(res.year4EbitdaMarginPercent).toBe(18);
  });

  it('adjusts revenue dynamically with volume variations', () => {
    const higherVol = calculateSensitivity({ volumeFactor: 1.2 });
    expect(higherVol.isBaseline).toBe(false);
    expect(higherVol.year4RevenueCrore).toBeGreaterThan(11.5);
    expect(higherVol.year4EbitdaCrore).toBeGreaterThan(2.1);
  });
});
