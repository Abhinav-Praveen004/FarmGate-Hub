import React from 'react';
import { CheckCircle2, Clock, QrCode, ShieldCheck, Tag } from 'lucide-react';
import { Badge } from './Badge.js';
import { formatWeightKg } from '@farmgate/shared';

export interface TimelineEvent {
  timestamp: string;
  status: string;
  actor: string;
  note?: string;
}

export interface LotTimelineProps {
  lotNumber: number;
  crop: string;
  weightGrams: number;
  grade: 'A' | 'B' | 'C';
  hoursInPod: number;
  holdingLimitHours?: number;
  qrCode: string;
  buyerMatchScore?: number;
  buyerMatchBreakdown?: {
    gradeFit: number;
    quantityFit: number;
    priceFit: number;
    deliveryWindowFit: number;
    reliabilityFit: number;
  };
  timeline: TimelineEvent[];
  className?: string;
}

export const LotTimeline: React.FC<LotTimelineProps> = ({
  lotNumber,
  crop,
  weightGrams,
  grade,
  hoursInPod,
  holdingLimitHours = 72,
  qrCode,
  buyerMatchScore = 78,
  buyerMatchBreakdown,
  timeline,
  className = '',
}) => {
  const gradeVariant = grade === 'A' ? 'grade_a' : grade === 'B' ? 'grade_b' : 'grade_c';
  const remainingHours = Math.max(0, holdingLimitHours - hoursInPod);

  return (
    <div className={`bg-surface-elevated border border-border rounded-lg p-5 shadow-sm ${className}`}>
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold text-ink">Lot #{lotNumber}</span>
          <Badge variant={gradeVariant}>Grade {grade}</Badge>
          <span className="text-sm font-semibold capitalize text-ink-muted">({crop})</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="simulated">Simulated</Badge>
          <div className="flex items-center gap-1 text-xs text-ink-muted font-mono bg-surface px-2 py-1 rounded">
            <QrCode className="w-3.5 h-3.5" />
            <span>{qrCode}</span>
          </div>
        </div>
      </div>

      {/* Lot Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface p-3 rounded-md">
          <div className="text-xs text-ink-muted font-medium">Digital Weight</div>
          <div className="text-xl font-bold text-ink mt-0.5 tabular-nums">{formatWeightKg(weightGrams)}</div>
          <div className="text-[11px] text-ink-muted">Certified scale</div>
        </div>

        <div className="bg-surface p-3 rounded-md">
          <div className="text-xs text-ink-muted font-medium">Time in Cool Pod</div>
          <div className="text-xl font-bold text-sky-800 mt-0.5 tabular-nums">{hoursInPod} Hours</div>
          <div className="text-[11px] text-ink-muted">{remainingHours}h limit remaining</div>
        </div>

        <div className="bg-[#eaf4ed] p-3 rounded-md border border-[#1f6b3a]/20">
          <div className="text-xs text-[#1f6b3a] font-medium">Buyer Match</div>
          <div className="text-xl font-bold text-[#1f6b3a] mt-0.5 tabular-nums">{buyerMatchScore}%</div>
          <div className="text-[11px] text-[#1f6b3a]">Annapurna Network</div>
        </div>

        <div className="bg-surface p-3 rounded-md">
          <div className="text-xs text-ink-muted font-medium">Quality Check</div>
          <div className="text-sm font-bold text-ink mt-1">Blemish &lt;5%</div>
          <div className="text-[11px] text-ink-muted">Firmness 4/5</div>
        </div>
      </div>

      {/* Match Breakdown Callout if available */}
      {buyerMatchBreakdown && (
        <div className="mb-5 bg-stone-50 border border-stone-200 rounded-md p-3 text-xs">
          <div className="font-semibold text-ink mb-1.5 flex items-center justify-between">
            <span>Buyer Match Breakdown ({buyerMatchScore}/100):</span>
            <span className="text-ink-muted font-normal">Weights: Grade 30, Qty 25, Price 20, Window 15, Trust 10</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center font-mono">
            <div className="bg-white p-1.5 rounded border border-stone-200">
              <span className="text-[10px] text-ink-muted block">Grade</span>
              <span className="font-bold text-accent">{buyerMatchBreakdown.gradeFit}/30</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-stone-200">
              <span className="text-[10px] text-ink-muted block">Quantity</span>
              <span className="font-bold text-accent">{buyerMatchBreakdown.quantityFit}/25</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-stone-200">
              <span className="text-[10px] text-ink-muted block">Price</span>
              <span className="font-bold text-accent">{buyerMatchBreakdown.priceFit}/20</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-stone-200">
              <span className="text-[10px] text-ink-muted block">Window</span>
              <span className="font-bold text-accent">{buyerMatchBreakdown.deliveryWindowFit}/15</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-stone-200">
              <span className="text-[10px] text-ink-muted block">Trust</span>
              <span className="font-bold text-accent">{buyerMatchBreakdown.reliabilityFit}/10</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div>
        <h4 className="text-xs uppercase font-mono tracking-wider text-ink-muted mb-3 font-semibold">
          Harvest Journey & Audit Trail
        </h4>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {timeline.map((event, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-accent ring-4 ring-white" />
              <div className="text-xs font-semibold text-ink uppercase tracking-wide flex items-center gap-2">
                <span>{event.status.replace(/_/g, ' ')}</span>
                <span className="text-[11px] font-normal text-ink-muted font-mono">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-xs text-ink-muted mt-0.5">{event.note || `Actor: ${event.actor}`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
