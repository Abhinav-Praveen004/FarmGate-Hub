import { getHubYearMetrics, HUB_CAPITAL_LAKH } from './hubCurve.js';
import { roundHalfAwayFromZero } from '../utils/money.js';

export interface NetworkYearMetrics {
  year: number;
  hubsLive: number;
  farmersServed: number;
  produceHandledTonnes: number;
  revenueCrore: number;
  hubOperatingCostCrore: number;
  centralCostCrore: number;
  ebitdaCrore: number;
  ebitdaMarginPercent: number;
  hubCapitalSpendCrore: number;
  extraFarmerIncomeCrore: number;
  // Raw unrounded values for exact verification
  raw: {
    revenueCrore: number;
    hubOperatingCostCrore: number;
    centralCostCrore: number;
    ebitdaCrore: number;
    extraFarmerIncomeCrore: number;
  };
}

export interface CohortSchedule {
  year1NewHubs: number; // 3
  year2NewHubs: number; // 7
  year3NewHubs: number; // 15
  year4NewHubs: number; // 0
}

export const DEFAULT_CENTRAL_COSTS_CRORE: Record<number, number> = {
  1: 0.6,
  2: 1.0,
  3: 1.6,
  4: 2.0,
};

export const EXTRA_FARMER_INCOME_PER_FARMER_RUPEES = 11400;

export function calculateNetworkModel(
  customCohorts?: Partial<CohortSchedule>,
  customCentralCosts?: Record<number, number>
): NetworkYearMetrics[] {
  const cohorts: CohortSchedule = {
    year1NewHubs: customCohorts?.year1NewHubs ?? 3,
    year2NewHubs: customCohorts?.year2NewHubs ?? 7,
    year3NewHubs: customCohorts?.year3NewHubs ?? 15,
    year4NewHubs: customCohorts?.year4NewHubs ?? 0,
  };

  const centralCosts = { ...DEFAULT_CENTRAL_COSTS_CRORE, ...customCentralCosts };

  const results: NetworkYearMetrics[] = [];

  for (let y = 1; y <= 4; y++) {
    let farmers = 0;
    let tonnes = 0;
    let revLakh = 0;
    let opCostLakh = 0;
    let hubsLive = 0;
    let newHubs = 0;

    if (y === 1) {
      newHubs = cohorts.year1NewHubs;
      hubsLive = cohorts.year1NewHubs;
      // Cohort 1 in Hub Year 1
      const c1 = getHubYearMetrics(1);
      farmers += cohorts.year1NewHubs * c1.farmers;
      tonnes += cohorts.year1NewHubs * c1.tonnes;
      revLakh += cohorts.year1NewHubs * c1.revenueLakh;
      opCostLakh += cohorts.year1NewHubs * c1.operatingCostLakh;
    } else if (y === 2) {
      newHubs = cohorts.year2NewHubs;
      hubsLive = cohorts.year1NewHubs + cohorts.year2NewHubs;
      // Cohort 1 in Hub Year 2
      const c1 = getHubYearMetrics(2);
      farmers += cohorts.year1NewHubs * c1.farmers;
      tonnes += cohorts.year1NewHubs * c1.tonnes;
      revLakh += cohorts.year1NewHubs * c1.revenueLakh;
      opCostLakh += cohorts.year1NewHubs * c1.operatingCostLakh;
      // Cohort 2 in Hub Year 1
      const c2 = getHubYearMetrics(1);
      farmers += cohorts.year2NewHubs * c2.farmers;
      tonnes += cohorts.year2NewHubs * c2.tonnes;
      revLakh += cohorts.year2NewHubs * c2.revenueLakh;
      opCostLakh += cohorts.year2NewHubs * c2.operatingCostLakh;
    } else if (y === 3) {
      newHubs = cohorts.year3NewHubs;
      hubsLive = cohorts.year1NewHubs + cohorts.year2NewHubs + cohorts.year3NewHubs;
      // Cohort 1 in Hub Year 3
      const c1 = getHubYearMetrics(3);
      farmers += cohorts.year1NewHubs * c1.farmers;
      tonnes += cohorts.year1NewHubs * c1.tonnes;
      revLakh += cohorts.year1NewHubs * c1.revenueLakh;
      opCostLakh += cohorts.year1NewHubs * c1.operatingCostLakh;
      // Cohort 2 in Hub Year 2
      const c2 = getHubYearMetrics(2);
      farmers += cohorts.year2NewHubs * c2.farmers;
      tonnes += cohorts.year2NewHubs * c2.tonnes;
      revLakh += cohorts.year2NewHubs * c2.revenueLakh;
      opCostLakh += cohorts.year2NewHubs * c2.operatingCostLakh;
      // Cohort 3 in Hub Year 1
      const c3 = getHubYearMetrics(1);
      farmers += cohorts.year3NewHubs * c3.farmers;
      tonnes += cohorts.year3NewHubs * c3.tonnes;
      revLakh += cohorts.year3NewHubs * c3.revenueLakh;
      opCostLakh += cohorts.year3NewHubs * c3.operatingCostLakh;
    } else if (y === 4) {
      newHubs = cohorts.year4NewHubs;
      hubsLive = cohorts.year1NewHubs + cohorts.year2NewHubs + cohorts.year3NewHubs + cohorts.year4NewHubs;
      // Cohort 1 in Hub Year 4 (equals Year 3)
      const c1 = getHubYearMetrics(4);
      farmers += cohorts.year1NewHubs * c1.farmers;
      tonnes += cohorts.year1NewHubs * c1.tonnes;
      revLakh += cohorts.year1NewHubs * c1.revenueLakh;
      opCostLakh += cohorts.year1NewHubs * c1.operatingCostLakh;
      // Cohort 2 in Hub Year 3
      const c2 = getHubYearMetrics(3);
      farmers += cohorts.year2NewHubs * c2.farmers;
      tonnes += cohorts.year2NewHubs * c2.tonnes;
      revLakh += cohorts.year2NewHubs * c2.revenueLakh;
      opCostLakh += cohorts.year2NewHubs * c2.operatingCostLakh;
      // Cohort 3 in Hub Year 2
      const c3 = getHubYearMetrics(2);
      farmers += cohorts.year3NewHubs * c3.farmers;
      tonnes += cohorts.year3NewHubs * c3.tonnes;
      revLakh += cohorts.year3NewHubs * c3.revenueLakh;
      opCostLakh += cohorts.year3NewHubs * c3.operatingCostLakh;
    }

    const rawRevCrore = revLakh / 100;
    const rawHubOpCostCrore = opCostLakh / 100;
    const centralCostCrore = centralCosts[y] ?? 0;
    const rawEbitdaCrore = rawRevCrore - rawHubOpCostCrore - centralCostCrore;
    const hubCapSpendCrore = (newHubs * HUB_CAPITAL_LAKH) / 100;
    const rawExtraFarmerIncomeCrore = (farmers * EXTRA_FARMER_INCOME_PER_FARMER_RUPEES) / 10_000_000;

    const roundedRevenue = roundHalfAwayFromZero(rawRevCrore, 2);
    const roundedHubOpCost = roundHalfAwayFromZero(rawHubOpCostCrore, 2);
    const roundedEbitda = roundHalfAwayFromZero(rawEbitdaCrore, 2);
    const roundedCapSpend = roundHalfAwayFromZero(hubCapSpendCrore, 2);
    const roundedExtraFarmerIncome = roundHalfAwayFromZero(rawExtraFarmerIncomeCrore, 2);
    const ebitdaMarginPercent =
      roundedRevenue > 0 ? roundHalfAwayFromZero((roundedEbitda / roundedRevenue) * 100, 0) : 0;

    results.push({
      year: y,
      hubsLive,
      farmersServed: farmers,
      produceHandledTonnes: tonnes,
      revenueCrore: roundedRevenue,
      hubOperatingCostCrore: roundedHubOpCost,
      centralCostCrore,
      ebitdaCrore: roundedEbitda,
      ebitdaMarginPercent,
      hubCapitalSpendCrore: roundedCapSpend,
      extraFarmerIncomeCrore: roundedExtraFarmerIncome,
      raw: {
        revenueCrore: rawRevCrore,
        hubOperatingCostCrore: rawHubOpCostCrore,
        centralCostCrore,
        ebitdaCrore: rawEbitdaCrore,
        extraFarmerIncomeCrore: rawExtraFarmerIncomeCrore,
      },
    });
  }

  return results;
}
