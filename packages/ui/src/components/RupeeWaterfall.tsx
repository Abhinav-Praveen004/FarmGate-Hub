import React from 'react';
import { Volume2 } from 'lucide-react';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { formatRupees } from '@farmgate/shared';

export interface RupeeWaterfallProps {
  consumerReferencePriceRupees?: number; // default ₹30.0
  farmerGrossPriceRupees?: number; // default ₹13.5
  farmerSharePercent?: number; // default 45%
  hubFeeRupees?: number; // default ₹1.9
  netPaidToFarmerRupees?: number; // default ₹11.6
  transportCostRupees?: number; // default ₹3.0
  handlingLossRupees?: number; // default ₹3.5
  intermediaryMarginRupees?: number; // default ₹10.0
  grossSaleTotalRupees?: number; // e.g. ₹1,350 for 100 kg
  feesDeductedTotalRupees?: number; // e.g. ₹190.5
  advanceDeductedTotalRupees?: number; // e.g. ₹0
  netPaidTotalRupees?: number; // e.g. ₹1,159.50
  onListen?: () => void;
  language?: 'en' | 'hi' | 'ta';
  className?: string;
  showHeader?: boolean;
}

export const RupeeWaterfall: React.FC<RupeeWaterfallProps> = ({
  consumerReferencePriceRupees = 30.0,
  farmerGrossPriceRupees = 13.5,
  farmerSharePercent = 45,
  hubFeeRupees = 1.9,
  netPaidToFarmerRupees = 11.6,
  transportCostRupees = 3.0,
  handlingLossRupees = 3.5,
  intermediaryMarginRupees = 10.0,
  grossSaleTotalRupees = 1350.0,
  feesDeductedTotalRupees = 190.5,
  advanceDeductedTotalRupees = 0,
  netPaidTotalRupees = 1159.5,
  onListen,
  className = '',
  showHeader = true,
}) => {
  // Percentage widths on total retail rupee (e.g. ₹30)
  const total = consumerReferencePriceRupees;
  const transportPct = (transportCostRupees / total) * 100;
  const handlingPct = (handlingLossRupees / total) * 100;
  const marginPct = (intermediaryMarginRupees / total) * 100;
  const hubFeePct = (hubFeeRupees / total) * 100;
  const farmerNetPct = (netPaidToFarmerRupees / total) * 100;

  return (
    <div className={`bg-surface-elevated border border-border rounded-xl p-4 sm:p-5 shadow-sm ${className}`}>
      {/* Header (optional, suppressed when parent screen renders its own header) */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-ink-muted">Transparent Receipt</span>
            <h3 className="text-lg font-bold text-ink">Where Your Rupee Went</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="simulated">Simulated</Badge>
            {onListen && (
              <Button
                variant="outline"
                size="sm"
                icon={<Volume2 className="w-4 h-4 text-accent" />}
                onClick={onListen}
                aria-label="Listen to receipt breakdown"
              >
                Listen
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Top summary cards (2x2 grid for mobile clarity, avoids cramming 4 micro-columns) */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="bg-surface p-3 rounded-lg border border-border/80">
          <div className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">Consumer Paid</div>
          <div className="text-lg sm:text-xl font-bold text-ink tabular-nums mt-0.5">
            ₹{consumerReferencePriceRupees.toFixed(2)}/kg
          </div>
          <div className="text-[10px] text-ink-muted mt-0.5">Market Reference</div>
        </div>

        <div className="bg-surface p-3 rounded-lg border border-border/80">
          <div className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">Farmer Gross Share</div>
          <div className="text-lg sm:text-xl font-bold text-accent tabular-nums mt-0.5">
            {farmerSharePercent}%
          </div>
          <div className="text-[10px] text-accent font-mono mt-0.5">
            ₹{farmerGrossPriceRupees.toFixed(2)}/kg realised
          </div>
        </div>

        <div className="bg-surface p-3 rounded-lg border border-border/80">
          <div className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">FarmGate Fee</div>
          <div className="text-lg sm:text-xl font-bold text-ink tabular-nums mt-0.5">
            ₹{hubFeeRupees.toFixed(2)}/kg
          </div>
          <div className="text-[10px] text-ink-muted mt-0.5">₹1.50/kg flat + 3%</div>
        </div>

        <div className="bg-accent/10 p-3 rounded-lg border border-accent/30 shadow-xs">
          <div className="text-[11px] text-accent font-bold uppercase tracking-wider">Net Paid to Farmer</div>
          <div className="text-lg sm:text-xl font-extrabold text-accent tabular-nums mt-0.5">
            ₹{netPaidToFarmerRupees.toFixed(2)}/kg
          </div>
          <div className="text-[10px] text-accent font-medium mt-0.5">via UPI within 24h</div>
        </div>
      </div>

      {/* Horizontal Stacked Bar Visual */}
      <div className="mb-5">
        <div className="flex justify-between items-center text-xs text-ink-muted mb-2 font-mono">
          <span>₹0.00</span>
          <span className="font-sans font-bold text-ink text-[11px]">
            Retail Price ₹{consumerReferencePriceRupees.toFixed(0)}/kg Waterfall
          </span>
          <span>₹{consumerReferencePriceRupees.toFixed(2)}</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="relative h-9 w-full bg-stone-200 rounded-lg overflow-hidden flex shadow-inner border border-border/60">
          {/* 1. Farmer Net */}
          <div
            style={{ width: `${farmerNetPct}%` }}
            className="h-full bg-[#1f6b3a] transition-all duration-500 flex items-center justify-center text-white text-[11px] font-bold px-1 overflow-hidden"
            title={`Net Paid to Farmer: ₹${netPaidToFarmerRupees.toFixed(2)}/kg (${farmerNetPct.toFixed(1)}%)`}
          >
            Farmer {farmerNetPct.toFixed(0)}%
          </div>

          {/* 2. Hub Fee */}
          <div
            style={{ width: `${hubFeePct}%` }}
            className="h-full bg-[#3d8b58] transition-all duration-500 flex items-center justify-center text-white text-[10px] font-medium px-0.5 overflow-hidden"
            title={`FarmGate Hub Fee: ₹${hubFeeRupees.toFixed(2)}/kg (${hubFeePct.toFixed(1)}%)`}
          />

          {/* 3. Transport */}
          <div
            style={{ width: `${transportPct}%` }}
            className="h-full bg-[#78716c] transition-all duration-500 flex items-center justify-center text-stone-100 text-[10px] px-0.5 overflow-hidden"
            title={`Transport & Logistics: ₹${transportCostRupees.toFixed(2)}/kg (${transportPct.toFixed(1)}%)`}
          />

          {/* 4. Handling & Wastage */}
          <div
            style={{ width: `${handlingPct}%` }}
            className="h-full bg-[#a8a29e] transition-all duration-500 flex items-center justify-center text-stone-900 text-[10px] px-0.5 overflow-hidden"
            title={`Handling Loss: ₹${handlingLossRupees.toFixed(2)}/kg (${handlingPct.toFixed(1)}%)`}
          />

          {/* 5. Intermediary Margin */}
          <div
            style={{ width: `${marginPct}%` }}
            className="h-full bg-[#d6d3d1] transition-all duration-500 flex items-center justify-center text-stone-800 text-[11px] font-bold px-1 overflow-hidden"
            title={`Retail Margin: ₹${intermediaryMarginRupees.toFixed(2)}/kg (${marginPct.toFixed(1)}%)`}
          >
            Retail {marginPct.toFixed(0)}%
          </div>

          {/* 33% Typical Share Benchmark Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
            style={{ left: '33%' }}
            title="Typical Traditional Mandi Share: 33% (RBI Bulletin)"
          />
        </div>

        {/* Mandi Benchmark Callout */}
        <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-ink-muted">
          <span className="flex items-center gap-1 text-red-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span>Mandi Baseline: 33% (₹{(consumerReferencePriceRupees * 0.33).toFixed(2)}/kg)</span>
          </span>
          <span className="text-emerald-700 font-bold">
            FarmGate Value Capture: +36%
          </span>
        </div>

        {/* Clear, Non-Overlapping Value Chain Legend */}
        <div className="mt-3 bg-surface rounded-lg p-2.5 border border-border/80 space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-accent font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1f6b3a] shrink-0" />
              <span>1. Net Paid to Farmer:</span>
            </span>
            <span>₹{netPaidToFarmerRupees.toFixed(2)}/kg ({farmerNetPct.toFixed(1)}%)</span>
          </div>

          <div className="flex items-center justify-between text-ink-muted text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3d8b58] shrink-0" />
              <span>2. FarmGate Cold Pod & Grading:</span>
            </span>
            <span className="text-ink">₹{hubFeeRupees.toFixed(2)}/kg ({hubFeePct.toFixed(1)}%)</span>
          </div>

          <div className="flex items-center justify-between text-ink-muted text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#78716c] shrink-0" />
              <span>3. Collective Freight & Logistics:</span>
            </span>
            <span className="text-ink">₹{transportCostRupees.toFixed(2)}/kg ({transportPct.toFixed(1)}%)</span>
          </div>

          <div className="flex items-center justify-between text-ink-muted text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a8a29e] shrink-0" />
              <span>4. Handling & Spoilage Protection:</span>
            </span>
            <span className="text-ink">₹{handlingLossRupees.toFixed(2)}/kg ({handlingPct.toFixed(1)}%)</span>
          </div>

          <div className="flex items-center justify-between text-ink-muted text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d6d3d1] shrink-0" />
              <span>5. Retail Supermarket Shelf Margin:</span>
            </span>
            <span className="text-ink">₹{intermediaryMarginRupees.toFixed(2)}/kg ({marginPct.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Screen Reader Accessible Data Table */}
      <div className="sr-only">
        <table>
          <caption>Rupee Breakdown for 1 kg of produce</caption>
          <thead>
            <tr>
              <th scope="col">Cost Component</th>
              <th scope="col">Amount (₹/kg)</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Net Paid to Farmer</td>
              <td>₹{netPaidToFarmerRupees.toFixed(2)}</td>
              <td>{farmerNetPct.toFixed(1)}%</td>
            </tr>
            <tr>
              <td>FarmGate Hub Storage and Grading Fee</td>
              <td>₹{hubFeeRupees.toFixed(2)}</td>
              <td>{hubFeePct.toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Transport and Handling</td>
              <td>₹{(transportCostRupees + handlingLossRupees).toFixed(2)}</td>
              <td>{((transportCostRupees + handlingLossRupees) / total * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Retailer and Wholesaler Margin</td>
              <td>₹{intermediaryMarginRupees.toFixed(2)}</td>
              <td>{marginPct.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rupee Ledger Breakdown for Lot (Receipt Card Style) */}
      <div className="mt-4 pt-3.5 border-t border-dashed border-border bg-surface/60 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase font-mono tracking-wider text-ink font-bold">
            Lot Settlement Summary
          </h4>
          <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
            UPI SETTLED
          </span>
        </div>
        <div className="space-y-1.5 text-xs font-mono tabular-nums">
          <div className="flex justify-between">
            <span className="text-ink-muted">Gross Produce Sale</span>
            <span className="font-bold text-ink">₹{grossSaleTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-ink-muted">
            <span>Hub Fee (₹1.50/kg + 3%)</span>
            <span className="text-red-700 font-semibold">-₹{feesDeductedTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          {advanceDeductedTotalRupees > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Advance Repaid</span>
              <span className="font-semibold">-₹{advanceDeductedTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border font-bold text-sm text-accent">
            <span>Net Paid to Farmer (Bank UPI)</span>
            <span className="text-emerald-700 text-base">₹{netPaidTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
