import { describe, it, expect } from 'vitest';
import { PROBLEM_EVIDENCE, ASSUMPTION_TEST, IDEA_SCORING, TEAM_CREDITS } from '../src/evidence/index.js';
import { getTranslations, TRANSLATIONS } from '../src/i18n/index.js';
import { calculateBuyerCommissionPaisePerKg } from '../src/utils/money.js';

describe('Evidence Base Validation', () => {
  it('contains reported facts from Section 4', () => {
    expect(PROBLEM_EVIDENCE.length).toBeGreaterThanOrEqual(13);
    const tomatoShare = PROBLEM_EVIDENCE.find((e) => e.id === 'farmer-share-tomato');
    expect(tomatoShare?.numericValue).toBe(33);

    const fpos = PROBLEM_EVIDENCE.find((e) => e.id === 'fpos-registered');
    expect(fpos?.numericValue).toBe(10000);
  });

  it('validates idea scoring and team credits', () => {
    const hubIdea = IDEA_SCORING.find((i) => i.chosen);
    expect(hubIdea?.name).toBe('FarmGate Hub');
    expect(hubIdea?.score).toBe(34);

    expect(TEAM_CREDITS.names).toHaveLength(6);
    expect(TEAM_CREDITS.course).toBe('Creativity and Innovation');
  });

  it('validates assumption test content', () => {
    expect(ASSUMPTION_TEST[0].verdict).toContain('Partially true');
    expect(ASSUMPTION_TEST[0].reasons).toHaveLength(5);
  });
});

describe('i18n Dictionaries', () => {
  it('retrieves English, Hindi, and Tamil dictionaries', () => {
    const enDict = getTranslations('en');
    expect(enDict.common.sell).toBe('SELL');
    expect(enDict.common.hold).toBe('HOLD');

    const hiDict = getTranslations('hi');
    expect(hiDict.common.sell).toContain('बेचें');

    const taDict = getTranslations('ta');
    expect(taDict.common.sell).toContain('விற்பனை');

    expect(TRANSLATIONS.en).toBeDefined();
    expect(TRANSLATIONS.hi).toBeDefined();
    expect(TRANSLATIONS.ta).toBeDefined();
  });
});

describe('Buyer Commission Utility', () => {
  it('calculates 2% buyer collective selling commission', () => {
    expect(calculateBuyerCommissionPaisePerKg(1400)).toBe(28); // 2% of ₹14 = 28 paise
  });
});
