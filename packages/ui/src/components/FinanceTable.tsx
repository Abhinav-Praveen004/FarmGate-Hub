import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { Badge } from './Badge.js';
import { NetworkYearMetrics } from '@farmgate/shared';

export interface FinanceTableProps {
  years: NetworkYearMetrics[];
  matchesReport?: boolean;
  className?: string;
}

export const FinanceTable: React.FC<FinanceTableProps> = ({
  years,
  matchesReport = true,
  className = '',
}) => {
  return (
    <div className={`bg-surface-elevated border border-border rounded-lg p-5 shadow-sm overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-ink">Network Financial Model (4-Year Cohorts)</h3>
            {matchesReport && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eaf4ed] text-[#1f6b3a] border border-[#1f6b3a]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Matches the Report
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted">All figures in ₹ Crore unless specified. Evaluated across 25 hub cohorts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="demo">Illustrative Pilot Forecast</Badge>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm tabular-nums">
          <thead>
            <tr className="border-b border-border text-xs uppercase font-mono text-ink-muted tracking-wider">
              <th scope="col" className="py-2.5 px-3 font-semibold">Metric</th>
              {years.map((y) => (
                <th key={y.year} scope="col" className="py-2.5 px-3 text-right font-semibold">
                  Year {y.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {/* Hubs Live */}
            <tr className="hover:bg-surface/50">
              <td className="py-2.5 px-3 font-medium text-ink">Hubs Live (Cumulative)</td>
              {years.map((y) => (
                <td key={y.year} className="py-2.5 px-3 text-right font-semibold text-ink">
                  {y.hubsLive}
                </td>
              ))}
            </tr>

            {/* Farmers Served */}
            <tr className="hover:bg-surface/50">
              <td className="py-2.5 px-3 text-ink-muted">Farmers Served</td>
              {years.map((y) => (
                <td key={y.year} className="py-2.5 px-3 text-right text-ink">
                  {y.farmersServed.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Produce Handled (Tonnes) */}
            <tr className="hover:bg-surface/50">
              <td className="py-2.5 px-3 text-ink-muted">Produce Handled (Tonnes)</td>
              {years.map((y) => (
                <td key={y.year} className="py-2.5 px-3 text-right text-ink">
                  {y.produceHandledTonnes.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Revenue */}
            <tr className="hover:bg-surface/50 font-medium">
              <td className="py-2.5 px-3 text-ink">Total Revenue (₹ Cr)</td>
              {years.map((y) => (
                <td key={y.year} className="py-2.5 px-3 text-right text-ink">
                  ₹{y.revenueCrore.toFixed(2)}
                </td>
              ))}
            </tr>

            {/* Hub Operating Cost */}
            <tr className="hover:bg-surface/50 text-ink-muted">
              <td className="py-2.5 px-3">Hub Operating Cost (₹ Cr)</td>
              {years.map((y) => (
                <td key={y.year} className="py-2.5 px-3 text-right">
                  ₹{y.hubOperatingCostCrore.toFixed(2)}
                </td>
              ))}
            </tr>

            {/* Central Cost */}
            <tr className="hover:bg-surface/50 text-ink-muted">
              <td className="py-2.5 px-3">Central Team & Technology (₹ Cr)</td>
              {years.map((y) => (
                <td key={y.year} className="py-2.5 px-3 text-right">
                  ₹{y.centralCostCrore.toFixed(2)}
                </td>
              ))}
            </tr>

            {/* EBITDA */}
            <tr className="hover:bg-surface/50 font-bold bg-surface/30">
              <td className="py-3 px-3 text-ink">EBITDA (₹ Cr)</td>
              {years.map((y) => (
                <td
                  key={y.year}
                  className={`py-3 px-3 text-right ${
                    y.ebitdaCrore >= 0 ? 'text-[#1f6b3a]' : 'text-stone-700'
                  }`}
                >
                  {y.ebitdaCrore >= 0 ? `+₹${y.ebitdaCrore.toFixed(2)}` : `-₹${Math.abs(y.ebitdaCrore).toFixed(2)}`}
                  {y.ebitdaMarginPercent > 0 && (
                    <span className="text-xs font-normal text-[#1f6b3a] ml-1">({y.ebitdaMarginPercent}%)</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Capital Spend */}
            <tr className="hover:bg-surface/50 text-ink-muted">
              <td className="py-2.5 px-3">Hub Capital Spend (₹ Cr)</td>
              {years.map((y) => (
                <td key={y.year} className="py-2.5 px-3 text-right">
                  ₹{y.hubCapitalSpendCrore.toFixed(2)}
                </td>
              ))}
            </tr>

            {/* Extra Farmer Income Created */}
            <tr className="hover:bg-surface/50 font-bold text-accent bg-[#eaf4ed]/40">
              <td className="py-3 px-3">Extra Farmer Income Created (₹ Cr)</td>
              {years.map((y) => (
                <td key={y.year} className="py-3 px-3 text-right text-accent font-extrabold">
                  ₹{y.extraFarmerIncomeCrore.toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex items-start gap-2 text-xs text-ink-muted">
        <Info className="w-4 h-4 shrink-0 text-accent mt-0.5" />
        <p>
          <strong className="text-ink">Reconciliation Identity:</strong> By Year 4, FarmGate Hub generates approximately ₹1.02 of extra net farmer income per ₹1 of company revenue (₹11.69 Cr farmer gain against ₹11.50 Cr revenue).
        </p>
      </div>
    </div>
  );
};
