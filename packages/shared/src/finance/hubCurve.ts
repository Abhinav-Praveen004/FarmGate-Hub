/**
 * Single Hub Over Time (Section 4.6)
 * Figures in ₹ Lakh.
 */

export interface HubYearMetrics {
  hubYear: number;
  farmers: number;
  tonnes: number;
  revenueLakh: number;
  operatingCostLakh: number;
  surplusLakh: number;
  otherIncomeLakh: number;
  feeRevenueLakh: number;
}

export const HUB_CAPITAL_LAKH = 25.0; // ₹25 Lakh per hub

export const HUB_YEAR_DATA: Record<number, HubYearMetrics> = {
  1: {
    hubYear: 1,
    farmers: 200,
    tonnes: 600,
    feeRevenueLakh: 16.5, // 600 * 0.0275
    otherIncomeLakh: 1.0,
    revenueLakh: 17.5,
    operatingCostLakh: 26.0,
    surplusLakh: -8.5,
  },
  2: {
    hubYear: 2,
    farmers: 350,
    tonnes: 1200,
    feeRevenueLakh: 33.0, // 1200 * 0.0275
    otherIncomeLakh: 3.0,
    revenueLakh: 36.0,
    operatingCostLakh: 28.0,
    surplusLakh: 8.0,
  },
  3: {
    hubYear: 3,
    farmers: 500,
    tonnes: 2000,
    feeRevenueLakh: 55.0, // 2000 * 0.0275
    otherIncomeLakh: 6.0,
    revenueLakh: 61.0,
    operatingCostLakh: 32.0,
    surplusLakh: 29.0,
  },
  4: {
    hubYear: 4,
    farmers: 500,
    tonnes: 2000,
    feeRevenueLakh: 55.0,
    otherIncomeLakh: 6.0,
    revenueLakh: 61.0,
    operatingCostLakh: 32.0,
    surplusLakh: 29.0,
  },
};

export function getHubYearMetrics(year: number): HubYearMetrics {
  if (year >= 4) {
    return { ...HUB_YEAR_DATA[4], hubYear: year };
  }
  return HUB_YEAR_DATA[year] || HUB_YEAR_DATA[1];
}

export function calculateHubPayback(): {
  capitalRequiredLakh: number;
  cumulativeSurplusAfterYear3Lakh: number;
  paybackYears: number;
} {
  const y1 = HUB_YEAR_DATA[1].surplusLakh; // -8.5
  const y2 = HUB_YEAR_DATA[2].surplusLakh; // 8.0
  const y3 = HUB_YEAR_DATA[3].surplusLakh; // 29.0
  const cumulative = y1 + y2 + y3; // 28.5

  // At end of Y2: -8.5 + 8.0 = -0.5 lakh.
  // In Y3: needs 0.5 lakh out of 29.0 lakh surplus = 2 + (0.5 / 29.0) ≈ 2.02 years to breakeven capital,
  // or conservatively stated as ~3 years.
  return {
    capitalRequiredLakh: HUB_CAPITAL_LAKH,
    cumulativeSurplusAfterYear3Lakh: cumulative,
    paybackYears: 3.0,
  };
}
