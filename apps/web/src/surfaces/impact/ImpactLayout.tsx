import React, { useState } from 'react';
import { KpiScorecards } from './KpiScorecards.js';
import { EconomicsCalculator } from './EconomicsCalculator.js';
import { CohortModelView } from './CohortModelView.js';
import { FundingMarketView } from './FundingMarketView.js';
import { SensitivitySliders } from './SensitivitySliders.js';
import { Badge, Button } from '@farmgate/ui';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  PieChart,
  Sliders,
  Printer,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

export const ImpactLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'economics' | 'cohort' | 'funding' | 'sensitivity'>('kpis');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-bg text-ink pb-16">
      {/* Sub-header Banner */}
      <div className="bg-surface-elevated border-b border-border py-3 px-4 sm:px-6 shadow-sm sticky top-12 z-30">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <h1 className="font-serif font-bold text-base text-ink">Impact & Investor Dashboard</h1>
              <Badge variant="success">SEED ROUND: ₹5.0 CR</Badge>
            </div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Source: Group 4 Report &apos;Improving Farmers&apos; Income&apos; • Section 4 Reconciled Financial Engine
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" />
              <span>Print Executive Summary</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex gap-2 border-b border-border pb-px overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'kpis'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>5 Core KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('economics')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'economics'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Per-Tonne Economics</span>
          </button>

          <button
            onClick={() => setActiveTab('cohort')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'cohort'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4-Year Cohort Model</span>
          </button>

          <button
            onClick={() => setActiveTab('funding')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'funding'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Funding & Market</span>
          </button>

          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sensitivity'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Sensitivity Sliders</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'kpis' && <KpiScorecards />}
          {activeTab === 'economics' && <EconomicsCalculator />}
          {activeTab === 'cohort' && <CohortModelView />}
          {activeTab === 'funding' && <FundingMarketView />}
          {activeTab === 'sensitivity' && <SensitivitySliders />}
        </div>
      </div>
    </div>
  );
};
