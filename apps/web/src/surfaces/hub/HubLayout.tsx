import React, { useState } from 'react';
import { IntakeWizard } from './IntakeWizard.js';
import { CoolPodBoard } from './CoolPodBoard.js';
import { CollectiveLoads } from './CollectiveLoads.js';
import { PayoutsQueue } from './PayoutsQueue.js';
import { GradeCRouting } from './GradeCRouting.js';
import { Badge } from '@farmgate/ui';
import {
  Scale,
  Thermometer,
  Truck,
  CreditCard,
  Clock,
  RotateCcw,
  FastForward,
  Radio,
  Recycle,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext.js';

export const HubLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'intake' | 'pod' | 'loads' | 'payouts' | 'grade_c'>('intake');
  const { clockTime, advanceClock, resetDemo, isSSEConnected, isWarping } = useDemo();

  return (
    <div className="min-h-screen bg-bg text-ink pb-16">
      {/* Sub-header Toolbar */}
      <div className="bg-surface-elevated border-b border-border py-2.5 px-4 sm:px-6 shadow-sm sticky top-12 z-30">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="font-bold text-sm text-ink">Kolar Hub #01</span>
              <Badge variant="simulated">OPERATOR CONSOLE</Badge>
            </div>
            <span className="text-ink-muted hidden md:inline">| Ravi Shankar (Hub Lead)</span>
          </div>

          {/* Time Warp Bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-ink-muted font-mono text-[11px] mr-2">
              <Radio className={`w-3.5 h-3.5 ${isSSEConnected ? 'text-accent animate-pulse' : 'text-amber-500'}`} />
              <span>{clockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => advanceClock(1)}
                disabled={isWarping}
                className="px-2 py-0.5 rounded bg-surface hover:bg-border text-ink font-mono text-xs border border-border"
              >
                +1h
              </button>
              <button
                onClick={() => advanceClock(6)}
                disabled={isWarping}
                className="px-2 py-0.5 rounded bg-surface hover:bg-border text-ink font-mono text-xs border border-border"
              >
                +6h
              </button>
              <button
                onClick={() => advanceClock(14)}
                disabled={isWarping}
                className="px-2 py-0.5 rounded bg-surface hover:bg-border text-ink font-mono text-xs border border-border font-bold text-accent"
              >
                +14h
              </button>
              <button
                onClick={() => advanceClock(24)}
                disabled={isWarping}
                className="px-2 py-0.5 rounded bg-surface hover:bg-border text-ink font-mono text-xs border border-border"
              >
                +24h
              </button>
              <button
                onClick={() => resetDemo()}
                disabled={isWarping}
                title="Reset Demo Data"
                aria-label="Reset Demo Data"
                className="p-1 rounded bg-surface hover:bg-border text-ink-muted hover:text-ink border border-border"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex gap-2 border-b border-border pb-px overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('intake')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'intake'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Intake & Grading</span>
          </button>

          <button
            onClick={() => setActiveTab('pod')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pod'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span>Cool Pod Board</span>
          </button>

          <button
            onClick={() => setActiveTab('loads')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'loads'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Collective Loads</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'payouts'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Advances & Payouts</span>
          </button>

          <button
            onClick={() => setActiveTab('grade_c')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'grade_c'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Recycle className="w-4 h-4" />
            <span>Grade-C Waste-to-Value</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'intake' && <IntakeWizard />}
          {activeTab === 'pod' && <CoolPodBoard />}
          {activeTab === 'loads' && <CollectiveLoads />}
          {activeTab === 'payouts' && <PayoutsQueue />}
          {activeTab === 'grade_c' && <GradeCRouting />}
        </div>
      </div>
    </div>
  );
};
