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
}) => {
  // Percentage widths on total retail rupee (e.g. ₹30)
  const total = consumerReferencePriceRupees;
  const transportPct = (transportCostRupees / total) * 100;
  const handlingPct = (handlingLossRupees / total) * 100;
  const marginPct = (intermediaryMarginRupees / total) * 100;
  const hubFeePct = (hubFeeRupees / total) * 100;
  const farmerNetPct = (netPaidToFarmerRupees / total) * 100;

  return (
    <div className={`bg-surface-elevated border border-border rounded-lg p-5 shadow-sm ${className}`}>
      {/* Header */}
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

      {/* Top summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface p-3 rounded-md">
          <div className="text-xs text-ink-muted font-medium">Consumer Paid</div>
          <div className="text-xl font-bold text-ink tabular-nums">{formatRupees(consumerReferencePriceRupees)}/kg</div>
          <div className="text-[11px] text-ink-muted mt-0.5">Market Reference</div>
        </div>
        <div className="bg-surface p-3 rounded-md">
          <div className="text-xs text-ink-muted font-medium">Farmer Gross Share</div>
          <div className="text-xl font-bold text-accent tabular-nums">{farmerSharePercent}%</div>
          <div className="text-[11px] text-ink-muted mt-0.5">{formatRupees(farmerGrossPriceRupees)}/kg realised</div>
        </div>
        <div className="bg-surface p-3 rounded-md">
          <div className="text-xs text-ink-muted font-medium">FarmGate Fee</div>
          <div className="text-xl font-bold text-ink tabular-nums">{formatRupees(hubFeeRupees)}/kg</div>
          <div className="text-[11px] text-ink-muted mt-0.5">₹1.50 flat + 3%</div>
        </div>
        <div className="bg-accent/10 p-3 rounded-md border border-accent/20">
          <div className="text-xs text-accent font-semibold">Net to Your Bank</div>
          <div className="text-xl font-extrabold text-accent tabular-nums">{formatRupees(netPaidToFarmerRupees)}/kg</div>
          <div className="text-[11px] text-accent mt-0.5">via UPI within 24h</div>
        </div>
      </div>

      {/* Horizontal Stacked Bar Visual */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs text-ink-muted mb-2">
          <span>₹0.00</span>
          <span className="font-semibold text-ink">Retail Price ₹{consumerReferencePriceRupees.toFixed(0)}/kg Waterfall</span>
          <span>{formatRupees(consumerReferencePriceRupees)}</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="relative h-10 w-full bg-stone-200 rounded-md overflow-hidden flex shadow-inner">
          {/* 1. Farmer Net */}
          <div
            style={{ width: `${farmerNetPct}%` }}
            className="h-full bg-[#1f6b3a] transition-all duration-500 flex items-center justify-center text-white text-xs font-semibold px-1"
            title={`Net to Farmer: ₹${netPaidToFarmerRupees.toFixed(1)}/kg`}
          >
            Farmer {farmerNetPct.toFixed(0)}%
          </div>

          {/* 2. Hub Fee */}
          <div
            style={{ width: `${hubFeePct}%` }}
            className="h-full bg-[#3d8b58] transition-all duration-500 flex items-center justify-center text-white text-[11px] font-medium px-1"
            title={`Hub Fee: ₹${hubFeeRupees.toFixed(1)}/kg`}
          >
            Hub
          </div>

          {/* 3. Transport */}
          <div
            style={{ width: `${transportPct}%` }}
            className="h-full bg-[#78716c] transition-all duration-500 flex items-center justify-center text-stone-100 text-[11px] px-1"
            title={`Transport: ₹${transportCostRupees.toFixed(1)}/kg`}
          >
            Logistics
          </div>

          {/* 4. Handling & Wastage */}
          <div
            style={{ width: `${handlingPct}%` }}
            className="h-full bg-[#a8a29e] transition-all duration-500 flex items-center justify-center text-stone-900 text-[11px] px-1"
            title={`Handling Loss: ₹${handlingLossRupees.toFixed(1)}/kg`}
          >
            Loss
          </div>

          {/* 5. Intermediary Margin */}
          <div
            style={{ width: `${marginPct}%` }}
            className="h-full bg-[#d6d3d1] transition-all duration-500 flex items-center justify-center text-stone-800 text-xs font-medium px-1"
            title={`Retail Margin: ₹${intermediaryMarginRupees.toFixed(1)}/kg`}
          >
            Retail {marginPct.toFixed(0)}%
          </div>

          {/* 33% Typical Share Benchmark Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
            style={{ left: '33%' }}
          >
            <div className="absolute -top-7 -left-12 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              Typical Share: 33% (RBI)
            </div>
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

      {/* Rupee Ledger Breakdown for Lot */}
      <div className="mt-4 pt-4 border-t border-border-subtle bg-surface/50 rounded-md p-3">
        <h4 className="text-xs uppercase font-mono tracking-wider text-ink-muted mb-2 font-semibold">
          Lot Settlement Summary
        </h4>
        <div className="space-y-1.5 text-sm tabular-nums">
          <div className="flex justify-between">
            <span className="text-ink-muted">Gross Produce Sale</span>
            <span className="font-medium text-ink">₹{grossSaleTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-ink-muted">
            <span>Hub Fee (₹1.50/kg + 3%)</span>
            <span>-₹{feesDeductedTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          {advanceDeductedTotalRupees > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Advance Repaid</span>
              <span>-₹{advanceDeductedTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border font-bold text-base text-accent">
            <span>Net Transferred via UPI</span>
            <span>₹{netPaidTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
