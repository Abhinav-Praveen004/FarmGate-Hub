import React, { useState } from 'react';
import { Badge } from '@farmgate/ui';
import {
  TrendingUp,
  Percent,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { formatRupees } from '@farmgate/shared';

export const EconomicsCalculator: React.FC = () => {
  const [annualTonnage, setAnnualTonnage] = useState<number>(15); // Average 2-acre smallholder produces 15 MT

  // Report Section 4.5 Exact Numbers per 1 MT (1,000 kg)
  const baselineGrossPerTonne = 12000.0;
  const baselineLossKg = 180; // 18% loss
  const baselineSoldKg = 820;
  const baselineCommission = 590.4;
  const baselineTransportDistress = 1090.0;
  const baselineNetRealization = 8751.6; // Exact report number

  const hubGrossPerTonne = 14000.0;
  const hubLossKg = 40; // 4% loss
  const hubSoldKg = 960;
  const hubGrossSale = 960 * 14.0; // ₹13,440
  const hubFees = 2308.8; // ₹1.50/kg + 3%
  const hubNetRealization = 11131.2; // Exact report number

  const perTonneUplift = hubNetRealization - baselineNetRealization; // ₹2,379.60
  const upliftPercentage = ((perTonneUplift / baselineNetRealization) * 100).toFixed(1); // 27.2%

  // Annual Household Impact
  const annualBaselineNet = baselineNetRealization * annualTonnage;
  const annualHubNet = hubNetRealization * annualTonnage;
  const annualExtraIncome = perTonneUplift * annualTonnage;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Section 4.5 Economic Framework</span>
          <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
            Per-Tonne Tomato Economics & Household Impact
            <Badge variant="grade_a">+27.2% NET UPLIFT</Badge>
          </h2>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Baseline Traditional Mandi */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-mono text-xs uppercase text-ink-muted font-semibold">Baseline Supply Chain</span>
              <h3 className="text-base font-bold text-ink mt-0.5">Traditional Mandi Channel</h3>
            </div>
            <Badge variant="neutral">Status Quo</Badge>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-ink-muted">
              <span>Harvested Volume:</span>
              <span>1,000 kg (1 MT)</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Post-Harvest Spoilage (18%):</span>
              <span>-180 kg lost</span>
            </div>
            <div className="flex justify-between text-ink">
              <span>Marketable Volume Sold:</span>
              <span>820 kg @ ₹12.00/kg</span>
            </div>
            <div className="flex justify-between text-ink-muted pt-1 border-t border-border">
              <span>Gross Sale Realized:</span>
              <span>₹9,840.00</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Commission Agent Cut (6%):</span>
              <span>-₹590.40</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Transport & Distress Loading:</span>
              <span>-₹498.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t-2 border-border">
              <span>Net Farmer In-Pocket:</span>
              <span className="text-red-700">₹8,751.60 / MT</span>
            </div>
          </div>
        </div>

        {/* Column 2: FarmGate Hub Model */}
        <div className="bg-accent/5 border-2 border-accent/40 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-mono text-xs uppercase text-accent font-semibold">Hub Direct Channel</span>
              <h3 className="text-base font-bold text-ink mt-0.5">FarmGate Hub Direct Aggregation</h3>
            </div>
            <Badge variant="success">Report Baseline</Badge>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-ink-muted">
              <span>Harvested Volume:</span>
              <span>1,000 kg (1 MT)</span>
            </div>
            <div className="flex justify-between text-accent font-semibold">
              <span>Pod Spoilage Loss (4%):</span>
              <span>-40 kg (78% less waste!)</span>
            </div>
            <div className="flex justify-between text-ink">
              <span>Marketable Graded Sold:</span>
              <span>960 kg @ ₹14.00/kg bid</span>
            </div>
            <div className="flex justify-between text-ink-muted pt-1 border-t border-accent/20">
              <span>Gross Sale Realized:</span>
              <span>₹13,440.00</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Hub Fee (₹1.50/kg + 3%):</span>
              <span>-₹2,308.80</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Transparent Intermediary Cut:</span>
              <span>₹0.00 (Zero Hidden Cuts)</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t-2 border-accent/30">
              <span>Net Farmer In-Pocket:</span>
              <span className="text-accent text-base">₹11,131.20 / MT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Uplift Banner */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
            Verified Value Creation
          </span>
          <h3 className="text-lg font-bold text-ink mt-0.5">
            +₹2,379.60 Extra Net Cash per Tonne (+27.2% Uplift)
          </h3>
          <p className="text-xs text-ink-muted mt-1">
            Where does the extra money come from? <strong>58%</strong> from saved physical crop spoilage (140 kg saved per tonne) and <strong>42%</strong> from direct verified buyer bidding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-center">
            <span className="text-xs text-ink-muted block">Physical Waste</span>
            <span className="font-mono font-bold text-accent text-sm">18% → 4%</span>
          </div>
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-center">
            <span className="text-xs text-ink-muted block">Consumer Share</span>
            <span className="font-mono font-bold text-accent text-sm">33% → 45%</span>
          </div>
        </div>
      </div>

      {/* Interactive Annual Smallholder Household Simulator */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Annual Smallholder Household Impact Simulator</h3>
            <p className="text-xs text-ink-muted">Model the cumulative real cash uplift for a 1.5 to 5-acre farm household.</p>
          </div>
          <span className="font-mono text-sm font-bold text-accent">{annualTonnage} MT / Year</span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={5}
            max={35}
            step={1}
            value={annualTonnage}
            onChange={(e) => setAnnualTonnage(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer h-2 bg-border/60 rounded-lg"
          />
          <div className="flex justify-between text-[11px] font-mono text-ink-muted">
            <span>5 MT (Marginal Farmer, 1 Acre)</span>
            <span>15 MT (Average Smallholder, 2 Acres)</span>
            <span>35 MT (Medium Farmer, 4-5 Acres)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center">
          <div className="bg-surface p-3 rounded-lg border border-border">
            <span className="text-xs text-ink-muted block">Traditional Net Income:</span>
            <span className="font-mono font-bold text-ink text-base">₹{Math.round(annualBaselineNet).toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-surface p-3 rounded-lg border border-border">
            <span className="text-xs text-ink-muted block">FarmGate Hub Net Income:</span>
            <span className="font-mono font-bold text-ink text-base">₹{Math.round(annualHubNet).toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-accent/10 p-3 rounded-lg border border-accent/30">
            <span className="text-xs text-accent font-bold block">Extra Net Cash for Household:</span>
            <span className="font-mono font-bold text-accent text-lg">+₹{Math.round(annualExtraIncome).toLocaleString('en-IN')} / yr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
