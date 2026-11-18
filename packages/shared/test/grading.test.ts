import { describe, it, expect } from 'vitest';
import { evaluateTomatoGrading, applyGradeOverride } from '../src/grading/index.js';

describe('Grading Engine (Section 6.2)', () => {
  it('assigns Grade A when blemish <= 5% and firmness >= 4', () => {
    const result = evaluateTomatoGrading({
      blemishPercent: 3,
      firmness: 4,
      sizeClass: 'medium',
      ripeness: 'turning',
    });
    expect(result.suggestedGrade).toBe('A');
    expect(result.priceFactorPercent).toBe(100);
    expect(result.isFlatPrice).toBe(false);
  });

  it('assigns Grade B when blemish <= 15% and firmness >= 3', () => {
    const result = evaluateTomatoGrading({
      blemishPercent: 12,
      firmness: 3,
      sizeClass: 'medium',
      ripeness: 'pink',
    });
    expect(result.suggestedGrade).toBe('B');
    expect(result.priceFactorPercent).toBe(85);
    expect(result.isFlatPrice).toBe(false);
  });

  it('assigns Grade C and routes to processor at flat ₹4/kg when specs fail', () => {
    const result = evaluateTomatoGrading({
      blemishPercent: 25,
      firmness: 2,
      sizeClass: 'small',
      ripeness: 'red',
    });
    expect(result.suggestedGrade).toBe('C');
    expect(result.isFlatPrice).toBe(true);
    expect(result.flatPricePaisePerKg).toBe(400); // ₹4.00/kg
  });

  it('allows operator override with required reason', () => {
    const override = applyGradeOverride('B', {
      overrideGrade: 'A',
      reason: 'Blemish is superficial skin marks only; flesh and sugar Brix test meet Grade A',
      operatorId: 'operator_ravi',
      timestamp: '2026-11-18T10:00:00Z',
    });
    expect(override.finalGrade).toBe('A');
    expect(override.auditLogEntry).toContain('operator_ravi');
    expect(override.auditLogEntry).toContain('Blemish is superficial');
  });

  it('rejects operator override if reason is empty', () => {
    expect(() => {
      applyGradeOverride('B', {
        overrideGrade: 'A',
        reason: '   ',
        operatorId: 'operator_ravi',
        timestamp: '2026-11-18T10:00:00Z',
      });
    }).toThrow('An override reason is required by the audit log.');
  });
});
