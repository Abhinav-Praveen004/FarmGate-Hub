import React from 'react';
import { Badge } from '@farmgate/ui';
import {
  PieChart,
  Target,
  Coins,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const FundingMarketView: React.FC = () => {
  const fundAllocations = [
    {
      category: 'Hub Hardware & Cold Chain Deployment',
      percent: 55,
      amountCr: '₹2.75 Cr',
      details: '10 solar-hybrid cool pods, digital platform scales, phase-change thermal storage backup.',
    },
    {
      category: 'Software, AI Matcher & Edge Architecture',
      percent: 25,
      amountCr: '₹1.25 Cr',
      details: 'WhatsApp & Voice IVR adapters, double-entry audit engine, dynamic buyer demand matching.',
    },
    {
      category: 'Working Capital & Operations Float',
      percent: 20,
      amountCr: '₹1.00 Cr',
      details: 'Instant produce advance liquidity pool (50-70% float) and hub operator team onboarding.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Section 4.8 Funding & Market Opportunity</span>
          <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
            Market Sizing & ₹5.00 Cr Seed Round Allocation
            <Badge variant="accent">SEED ASK</Badge>
          </h2>
        </div>
      </div>

      {/* Market Sizing (TAM / SAM / SOM) Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TAM */}
        <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-ink-muted font-bold">TOTAL ADDRESSABLE MARKET</span>
            <Badge variant="neutral">TAM</Badge>
          </div>
          <div>
            <span className="text-3xl font-mono font-bold text-ink">₹38,600 Cr</span>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Total post-harvest physical loss and uncaptured intermediary margins across 330M tonnes of Indian horticulture.
            </p>
          </div>
        </div>

        {/* SAM */}
        <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-accent font-bold">SERVICEABLE ADDRESSABLE MARKET</span>
            <Badge variant="success">SAM</Badge>
          </div>
          <div>
            <span className="text-3xl font-mono font-bold text-accent">₹610 Cr</span>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              5 priority peri-urban vegetable clusters (Kolar, Madanapalle, Nashik, Pune, Chittoor) supplying metro demand.
            </p>
          </div>
        </div>

        {/* SOM */}
        <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-ink-muted font-bold">SERVICEABLE OBTAINABLE MARKET</span>
            <Badge variant="neutral">SOM</Badge>
          </div>
          <div>
            <span className="text-3xl font-mono font-bold text-ink">₹6.98 Cr</span>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Target Year 3 network revenue across 25 initial operational FarmGate Hubs operating at steady-state.
            </p>
          </div>
        </div>
      </div>

      {/* Use of Funds Table & Bar */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-ink">₹5.00 Crore Seed Round: Use of Funds</h3>
          </div>
          <span className="text-xs font-mono text-ink-muted">Payback: 2.6 Years</span>
        </div>

        {/* Visual Allocation Stack Bar */}
        <div className="w-full h-4 bg-border/40 rounded-full overflow-hidden flex">
          <div className="bg-accent h-full" style={{ width: '55%' }} title="Hardware (55%)" />
          <div className="bg-emerald-600 h-full" style={{ width: '25%' }} title="Software (25%)" />
          <div className="bg-amber-500 h-full" style={{ width: '20%' }} title="Working Capital (20%)" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {fundAllocations.map((fund) => (
            <div key={fund.category} className="bg-surface p-4 rounded-lg border border-border space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-lg font-bold text-ink">{fund.amountCr}</span>
                <span className="font-mono font-bold text-accent text-sm">{fund.percent}%</span>
              </div>
              <h4 className="font-bold text-xs text-ink">{fund.category}</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">{fund.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
