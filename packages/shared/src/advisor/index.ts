import { ActionType, Crop } from '../types/index.js';
import { roundHalfAwayFromZero } from '../utils/money.js';

export interface PriceForecastRange {
  horizonHours: number; // e.g. 24 (1 day)
  expectedLowRupeesPerKg: number;
  expectedMidRupeesPerKg: number;
  expectedHighRupeesPerKg: number;
}

export interface AdvisorContext {
  crop: Crop;
  currentMandiPriceRupeesPerKg: number;
  bestBuyerBidRupeesPerKg: number;
  floorPriceRupeesPerKg: number;
  forecast1Day: PriceForecastRange;
  remainingPodHoldHours: number;
}

export interface AdvisorRecommendation {
  recommendedAction: ActionType | 'CLOSE_CALL';
  explanation: string;
  mandiPriceRupeesPerKg: number;
  bestBidRupeesPerKg: number;
  floorPriceRupeesPerKg: number;
  forecast1Day: PriceForecastRange;
  remainingPodHoldHours: number;
  allowedHoldOptions: number[]; // [24, 48, 72]
}

/**
 * Rule-based decision advisor complying with Section 6.3.
 */
export function evaluatePriceAdvice(ctx: AdvisorContext): AdvisorRecommendation {
  const {
    currentMandiPriceRupeesPerKg,
    bestBuyerBidRupeesPerKg,
    floorPriceRupeesPerKg,
    forecast1Day,
    remainingPodHoldHours,
  } = ctx;

  let recommendedAction: ActionType | 'CLOSE_CALL' = 'CLOSE_CALL';
  let explanation = '';

  // Rule 1: Recommend SELL if best bid >= floor AND best bid >= forecast mid
  if (
    bestBuyerBidRupeesPerKg >= floorPriceRupeesPerKg &&
    bestBuyerBidRupeesPerKg >= forecast1Day.expectedMidRupeesPerKg
  ) {
    recommendedAction = 'SELL';
    explanation = `Buyer bid of ₹${roundHalfAwayFromZero(bestBuyerBidRupeesPerKg, 1)}/kg is above the FPO floor (₹${roundHalfAwayFromZero(floorPriceRupeesPerKg, 1)}/kg) and matches strong 24h market outlook. Recommend selling now.`;
  }
  // Rule 2: Recommend HOLD if best bid < floor, forecast high >= floor, and remaining pod hours covers horizon
  else if (
    bestBuyerBidRupeesPerKg < floorPriceRupeesPerKg &&
    forecast1Day.expectedHighRupeesPerKg >= floorPriceRupeesPerKg &&
    remainingPodHoldHours >= forecast1Day.horizonHours
  ) {
    recommendedAction = 'HOLD';
    explanation = `Best bid (₹${roundHalfAwayFromZero(bestBuyerBidRupeesPerKg, 1)}/kg) is below your collective floor price of ₹${roundHalfAwayFromZero(floorPriceRupeesPerKg, 1)}/kg. Expected price in 24h is ₹${roundHalfAwayFromZero(forecast1Day.expectedLowRupeesPerKg, 0)} to ₹${roundHalfAwayFromZero(forecast1Day.expectedHighRupeesPerKg, 0)}/kg. Recommend holding in the cool pod.`;
  }
  // Rule 3: Close call
  else {
    recommendedAction = 'CLOSE_CALL';
    explanation = `This is a close call. Market bids are close to the holding threshold. Consider your cash needs before deciding to sell today or hold.`;
  }

  return {
    recommendedAction,
    explanation,
    mandiPriceRupeesPerKg: currentMandiPriceRupeesPerKg,
    bestBidRupeesPerKg: bestBuyerBidRupeesPerKg,
    floorPriceRupeesPerKg,
    forecast1Day,
    remainingPodHoldHours,
    allowedHoldOptions: [24, 48, 72].filter((h) => h <= remainingPodHoldHours),
  };
}
