/**
 * Integer Money and Weight Utilities
 * All financial amounts are handled as integer paise (100 paise = 1 INR).
 * All weights are handled as integer grams (1000 grams = 1 kg).
 */

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function gramsToKg(grams: number): number {
  return grams / 1000;
}

export function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

/**
 * Round half away from zero (standard commercial / financial rounding).
 * Example: -0.855 -> -0.86, 0.855 -> 0.86
 */
export function roundHalfAwayFromZero(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  const sign = num < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(num) * factor)) / factor;
}

/**
 * Calculates hub fee for a given sale price per kg.
 * Rule: ₹1.50/kg flat storage & grading fee + 3% farmer collective selling commission.
 * Returns fee in paise per kg.
 */
export function calculateFarmerFeePaisePerKg(salePricePaisePerKg: number): number {
  const flatStorageFeePaise = 150; // ₹1.50
  const commissionPaise = Math.round(salePricePaisePerKg * 0.03); // 3%
  return flatStorageFeePaise + commissionPaise;
}

/**
 * Calculates buyer commission.
 * Rule: 2% buyer collective selling commission.
 * Returns fee in paise per kg.
 */
export function calculateBuyerCommissionPaisePerKg(salePricePaisePerKg: number): number {
  return Math.round(salePricePaisePerKg * 0.02);
}
