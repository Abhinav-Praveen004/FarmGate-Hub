import { Grade, QualityParameters } from '../types/index.js';

export interface GradingResult {
  suggestedGrade: Grade;
  priceFactorPercent: number; // 100 for A, 85 for B, flat price for C
  isFlatPrice: boolean;
  flatPricePaisePerKg?: number; // 400 paise (₹4) for C
  reasons: string[];
}

export interface OperatorOverride {
  overrideGrade: Grade;
  reason: string;
  operatorId: string;
  timestamp: string;
}

export function evaluateTomatoGrading(params: QualityParameters): GradingResult {
  const reasons: string[] = [];

  // Grade A: blemish <= 5% and firmness >= 4
  if (params.blemishPercent <= 5 && params.firmness >= 4) {
    reasons.push('Low blemish level (≤ 5%) and firm fruit (≥ 4/5)');
    return {
      suggestedGrade: 'A',
      priceFactorPercent: 100,
      isFlatPrice: false,
      reasons,
    };
  }

  // Grade B: blemish <= 15% and firmness >= 3
  if (params.blemishPercent <= 15 && params.firmness >= 3) {
    if (params.blemishPercent > 5) {
      reasons.push(`Moderate surface blemishes (${params.blemishPercent}%)`);
    }
    if (params.firmness < 4) {
      reasons.push(`Firmness rating ${params.firmness}/5 suitable for quick local dispatch`);
    }
    return {
      suggestedGrade: 'B',
      priceFactorPercent: 85,
      isFlatPrice: false,
      reasons,
    };
  }

  // Grade C: all others
  reasons.push(`High blemish (${params.blemishPercent}%) or low firmness (${params.firmness}/5). Routed to food processing partner.`);
  return {
    suggestedGrade: 'C',
    priceFactorPercent: 0,
    isFlatPrice: true,
    flatPricePaisePerKg: 400, // ₹4.00/kg flat processing price
    reasons,
  };
}

export function applyGradeOverride(
  originalGrade: Grade,
  override: OperatorOverride
): { finalGrade: Grade; auditLogEntry: string } {
  if (!override.reason || override.reason.trim().length === 0) {
    throw new Error('An override reason is required by the audit log.');
  }

  return {
    finalGrade: override.overrideGrade,
    auditLogEntry: `Grade changed from ${originalGrade} to ${override.overrideGrade} by ${override.operatorId}: "${override.reason.trim()}" at ${override.timestamp}`,
  };
}
