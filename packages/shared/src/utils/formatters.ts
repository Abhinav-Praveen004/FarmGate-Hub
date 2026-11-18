import { paiseToRupees, roundHalfAwayFromZero } from './money.js';

/**
 * Formats a value in paise as an Indian Rupee string with the ₹ symbol
 * and Indian number grouping (en-IN).
 */
export function formatINR(
  paise: number,
  options: { showPaise?: boolean; tabular?: boolean } = {}
): string {
  const rupees = paiseToRupees(paise);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: options.showPaise ? 2 : 0,
    maximumFractionDigits: options.showPaise ? 2 : 0,
  }).format(rupees);
  return `₹${formatted}`;
}

/**
 * Formats a rupee amount with specific decimal places.
 */
export function formatRupees(rupees: number, decimals: number = 1): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rupees);
  return `₹${formatted}`;
}

/**
 * Formats rate per kg.
 * Example: 1350 paise -> "₹13.5/kg"
 */
export function formatRatePerKg(paisePerKg: number, decimals: number = 1): string {
  const rupees = paiseToRupees(paisePerKg);
  return `${formatRupees(rupees, decimals)}/kg`;
}

/**
 * Formats weight in grams to kg string with 1 decimal.
 * Example: 120000 -> "120.0 kg"
 */
export function formatWeightKg(grams: number, decimals: number = 1): string {
  const kg = grams / 1000;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(kg);
  return `${formatted} kg`;
}

/**
 * Formats large amounts in Lakh or Crore.
 * 1 Lakh = 100,000 INR
 * 1 Crore = 10,000,000 INR
 */
export function formatLakhCrore(rupees: number): string {
  const abs = Math.abs(rupees);
  const sign = rupees < 0 ? '-' : '';
  if (abs >= 10_000_000) {
    const cr = roundHalfAwayFromZero(abs / 10_000_000, 2);
    return `${sign}₹${cr.toFixed(2)} Cr`;
  }
  if (abs >= 100_000) {
    const lk = roundHalfAwayFromZero(abs / 100_000, 1);
    return `${sign}₹${lk.toFixed(1)} Lakh`;
  }
  return `${sign}₹${new Intl.NumberFormat('en-IN').format(roundHalfAwayFromZero(abs, 0))}`;
}

/**
 * Formats an amount given directly in Crores.
 * Example: -0.855 -> "-₹0.86 Cr", 2.1 -> "+₹2.10 Cr"
 */
export function formatCroreDisplay(
  croreAmount: number,
  options: { includeSign?: boolean; decimals?: number } = {}
): string {
  const decimals = options.decimals ?? 2;
  const rounded = roundHalfAwayFromZero(croreAmount, decimals);
  const absFormatted = Math.abs(rounded).toFixed(decimals);
  let prefix = '₹';
  if (rounded < 0) {
    prefix = '-₹';
  } else if (options.includeSign && rounded > 0) {
    prefix = '+₹';
  }
  return `${prefix}${absFormatted} Cr`;
}
