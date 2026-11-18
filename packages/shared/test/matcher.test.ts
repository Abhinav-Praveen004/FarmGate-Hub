import { describe, it, expect } from 'vitest';
import { calculateBuyerMatch } from '../src/matcher/index.js';

describe('Buyer Matcher Engine (Section 6.4)', () => {
  it('tunes Lot #214 against Annapurna Kirana Network order to score exactly 78%', () => {
    // Lot #214: 120 kg Grade A tomato, 58h remaining in pod
    // Annapurna order: 500 kg Grade A tomato at ₹14/kg (1400 paise), 24h window, 92% reliability
    // Hub floor: ₹11/kg (1100 paise)
    const match = calculateBuyerMatch({
      lotCrop: 'tomato',
      orderCrop: 'tomato',
      lotGrade: 'A',
      orderGrade: 'A',
      lotWeightGrams: 120_000,
      orderWeightGrams: 500_000,
      offeredPricePaisePerKg: 1400,
      floorPricePaisePerKg: 1100,
      remainingPodHours: 58,
      orderDeliveryWindowHours: 24,
      buyerReliabilityPercent: 92,
    });

    expect(match.totalScore).toBe(78);
    expect(match.breakdown.gradeFit).toBe(30);
    expect(match.breakdown.quantityFit).toBe(17);
    expect(match.breakdown.priceFit).toBe(18);
    expect(match.breakdown.deliveryWindowFit).toBe(4);
    expect(match.breakdown.reliabilityFit).toBe(9);
    expect(
      match.breakdown.gradeFit +
        match.breakdown.quantityFit +
        match.breakdown.priceFit +
        match.breakdown.deliveryWindowFit +
        match.breakdown.reliabilityFit
    ).toBe(78);
  });

  it('returns 0 when crop does not match', () => {
    const match = calculateBuyerMatch({
      lotCrop: 'onion',
      orderCrop: 'tomato',
      lotGrade: 'A',
      orderGrade: 'A',
      lotWeightGrams: 100_000,
      orderWeightGrams: 100_000,
      offeredPricePaisePerKg: 1400,
      floorPricePaisePerKg: 1100,
      remainingPodHours: 50,
      orderDeliveryWindowHours: 24,
      buyerReliabilityPercent: 90,
    });

    expect(match.totalScore).toBe(0);
  });
});
