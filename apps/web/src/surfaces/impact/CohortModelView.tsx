import React from 'react';
import { FinanceTable, Badge } from '@farmgate/ui';
import { TrendingUp, BarChart3, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { calculateNetworkModel } from '@farmgate/shared';

export const CohortModelView: React.FC = () => {
  const years = calculateNetworkModel();
  const chartData = [
    { year: 'Year 1', hubs: 3, volume: 3000, revenue: 0.69, ebitda: -0.04, margin: '-6%' },
    { year: 'Year 2', hubs: 10, volume: 12000, revenue: 2.76, ebitda: 0.24, margin: '9%' },
    { year: 'Year 3', hubs: 25, volume: 37500, revenue: 8.63, ebitda: 1.57, margin: '18%' },
    { year: 'Year 4', hubs: 25, volume: 50000, revenue: 11.50, ebitda: 2.10, margin: '18%' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Section 4.7 Financial Model</span>
          <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
            4-Year Network Projections & Unit Economics
            <Badge variant="success">MATCHES THE REPORT</Badge>
          </h2>
        </div>
      </div>

      {/* Signature FinanceTable Component */}
      <FinanceTable years={years} />

      {/* Visual Chart Card */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-ink">Network Revenue & EBITDA Expansion (₹ Crores)</h3>
          </div>
          <span className="text-xs font-mono text-ink-muted">25 Hub Mature Network</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          {chartData.map((d) => {
            const isEbitdaPositive = d.ebitda > 0;
            const revBarHeight = Math.max(12, (d.revenue / 12) * 140);
            return (
              <div key={d.year} className="bg-surface p-4 rounded-xl border border-border flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-ink">{d.year}</span>
                    <span className="font-mono text-accent font-semibold">{d.hubs} Hubs</span>
                  </div>
                  <span className="text-[11px] text-ink-muted block mt-0.5 font-mono">
                    {d.volume.toLocaleString('en-IN')} MT
                  </span>
                </div>

                {/* Relative Bar visual */}
                <div className="h-36 flex items-end justify-center gap-3 py-2 border-b border-border">
                  {/* Revenue Bar */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-mono text-ink font-bold">₹{d.revenue}Cr</span>
                    <div
                      className="w-7 bg-accent rounded-t transition-all"
                      style={{ height: `${revBarHeight}px` }}
                      title={`Revenue: ₹${d.revenue} Cr`}
                    />
                    <span className="text-[9px] uppercase font-mono text-ink-muted">Rev</span>
                  </div>

                  {/* EBITDA Bar */}
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-[10px] font-mono font-bold ${isEbitdaPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isEbitdaPositive ? `+₹${d.ebitda}Cr` : `-₹0.04Cr`}
                    </span>
                    <div
                      className={`w-7 rounded-t transition-all ${isEbitdaPositive ? 'bg-emerald-600' : 'bg-red-400'}`}
                      style={{ height: `${Math.max(6, Math.abs(d.ebitda / 12) * 140)}px` }}
                      title={`EBITDA: ${d.ebitda} Cr`}
                    />
                    <span className="text-[9px] uppercase font-mono text-ink-muted">Ebitda</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono pt-1">
                  <span className="text-ink-muted">EBITDA Margin:</span>
                  <span className={`font-bold ${isEbitdaPositive ? 'text-accent' : 'text-red-500'}`}>
                    {d.margin}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
