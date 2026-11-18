import { describe, it, expect } from 'vitest';
import { evaluatePriceAdvice } from '../src/advisor/index.js';

describe('Advisor Rule Engine (Section 6.3)', () => {
  it('recommends SELL when best bid is above floor and above forecast mid', () => {
    // Screen 1 after Annapurna bid comes in: mandi 9, bid 14, floor 11, forecast mid 14
    const advice = evaluatePriceAdvice({
      crop: 'tomato',
      currentMandiPriceRupeesPerKg: 9.0,
      bestBuyerBidRupeesPerKg: 14.0,
      floorPriceRupeesPerKg: 11.0,
      forecast1Day: {
        horizonHours: 24,
        expectedLowRupeesPerKg: 13.0,
        expectedMidRupeesPerKg: 14.0,
        expectedHighRupeesPerKg: 15.0,
      },
      remainingPodHoldHours: 58,
    });

    expect(advice.recommendedAction).toBe('SELL');
    expect(advice.explanation).toContain('Recommend selling now');
    expect(advice.bestBidRupeesPerKg).toBe(14.0);
    expect(advice.floorPriceRupeesPerKg).toBe(11.0);
  });

  it('recommends HOLD when best bid is below floor, forecast high >= floor, and pod time covers horizon', () => {
    // T=0 state: mandi 9, best bid 10, floor 11, forecast 13-15
    const advice = evaluatePriceAdvice({
      crop: 'tomato',
      currentMandiPriceRupeesPerKg: 9.0,
      bestBuyerBidRupeesPerKg: 10.0,
      floorPriceRupeesPerKg: 11.0,
      forecast1Day: {
        horizonHours: 24,
        expectedLowRupeesPerKg: 13.0,
        expectedMidRupeesPerKg: 14.0,
        expectedHighRupeesPerKg: 15.0,
      },
      remainingPodHoldHours: 72,
    });

    expect(advice.recommendedAction).toBe('HOLD');
    expect(advice.explanation).toContain('Recommend holding in the cool pod');
    expect(advice.allowedHoldOptions).toEqual([24, 48, 72]);
  });

  it('returns CLOSE_CALL when criteria are mixed', () => {
    const advice = evaluatePriceAdvice({
      crop: 'tomato',
      currentMandiPriceRupeesPerKg: 11.0,
      bestBuyerBidRupeesPerKg: 11.2,
      floorPriceRupeesPerKg: 11.0,
      forecast1Day: {
        horizonHours: 24,
        expectedLowRupeesPerKg: 11.0,
        expectedMidRupeesPerKg: 12.5,
        expectedHighRupeesPerKg: 13.0,
      },
      remainingPodHoldHours: 72,
    });

    expect(advice.recommendedAction).toBe('CLOSE_CALL');
    expect(advice.explanation).toContain('close call');
  });
});
