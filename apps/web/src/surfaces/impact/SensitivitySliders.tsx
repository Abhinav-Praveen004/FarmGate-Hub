import React, { useState } from 'react';
import { Badge, Button } from '@farmgate/ui';
import { Sliders, RotateCcw, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { calculateSensitivity } from '@farmgate/shared';

export const SensitivitySliders: React.FC = () => {
  const [volumeFactor, setVolumeFactor] = useState<number>(1.0); // 0.7 to 1.3
  const [averageRealisedPriceRupees, setAverageRealisedPriceRupees] = useState<number>(25.0); // ₹15 to ₹35
  const [adoptionSpeedFactor, setAdoptionSpeedFactor] = useState<number>(1.0); // 0.6 to 1.2

  // Compute live sensitivity
  const results = calculateSensitivity({
    volumeFactor,
    averageRealisedPriceRupees,
    adoptionSpeedFactor,
  });

  const handleReset = () => {
    setVolumeFactor(1.0);
    setAverageRealisedPriceRupees(25.0);
    setAdoptionSpeedFactor(1.0);
  };

  const isBaseCase = volumeFactor === 1.0 && averageRealisedPriceRupees === 25.0 && adoptionSpeedFactor === 1.0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Section 4.9 Scenario Engine</span>
          <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
            Interactive Sensitivity & Stress Testing
            <Badge variant={isBaseCase ? 'success' : 'warning'}>
              {isBaseCase ? 'BASE CASE' : 'STRESSED SCENARIO'}
            </Badge>
          </h2>
        </div>

        <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-1.5 text-xs">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Base</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (6 cols) */}
        <div className="lg:col-span-6 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-ink font-bold text-sm">
            <Sliders className="w-4 h-4 text-accent" />
            <span>Operational Levers</span>
          </div>

          {/* Slider 1: Volume Factor */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-ink">Network Harvest Volume:</span>
              <span className="font-mono font-bold text-accent">
                {Math.round((volumeFactor - 1) * 100) > 0 ? `+${Math.round((volumeFactor - 1) * 100)}%` : `${Math.round((volumeFactor - 1) * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.3}
              step={0.05}
              value={volumeFactor}
              onChange={(e) => setVolumeFactor(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer h-2 bg-border/50 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-ink-muted">
              <span>-30% (Severe Drought)</span>
              <span>1.0x (Base: 50,000 MT)</span>
              <span>+30% (Bumper Harvest)</span>
            </div>
          </div>

          {/* Slider 2: Average Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-ink">Average Consumer Reference Price:</span>
              <span className="font-mono font-bold text-accent">₹{averageRealisedPriceRupees.toFixed(2)} / kg</span>
            </div>
            <input
              type="range"
              min={15.0}
              max={35.0}
              step={1.0}
              value={averageRealisedPriceRupees}
              onChange={(e) => setAverageRealisedPriceRupees(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer h-2 bg-border/50 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-ink-muted">
              <span>₹15.00 (Mandi Glut)</span>
              <span>₹25.00 (Base Case)</span>
              <span>₹35.00 (Off-Season Peak)</span>
            </div>
          </div>

          {/* Slider 3: Farmer Adoption */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-ink">Farmer Adoption Speed:</span>
              <span className="font-mono font-bold text-accent">{(adoptionSpeedFactor * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.2}
              step={0.05}
              value={adoptionSpeedFactor}
              onChange={(e) => setAdoptionSpeedFactor(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer h-2 bg-border/50 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-ink-muted">
              <span>60% (Conservative Ramp)</span>
              <span>100% (Base Model)</span>
              <span>120% (Rapid Viral)</span>
            </div>
          </div>
        </div>

        {/* Live Recomputed Outcomes (6 cols) */}
        <div className="lg:col-span-6 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
              Dynamic Year 4 Model Output
            </span>
            <span className="text-xs font-mono text-ink-muted">25 Hub Network</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface p-3.5 rounded-lg border border-border">
              <span className="text-xs text-ink-muted block">Year 4 Revenue:</span>
              <span className="font-mono font-bold text-xl text-ink">
                ₹{results.year4RevenueCrore.toFixed(2)} Cr
              </span>
              <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">
                Base: ₹11.50 Cr
              </span>
            </div>

            <div className="bg-surface p-3.5 rounded-lg border border-border">
              <span className="text-xs text-ink-muted block">Year 4 EBITDA:</span>
              <span className={`font-mono font-bold text-xl ${results.year4EbitdaCrore >= 0 ? 'text-accent' : 'text-red-500'}`}>
                {results.year4EbitdaCrore >= 0 ? `+₹${results.year4EbitdaCrore.toFixed(2)} Cr` : `-₹${Math.abs(results.year4EbitdaCrore).toFixed(2)} Cr`}
              </span>
              <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">
                Margin: {results.year4EbitdaMarginPercent.toFixed(1)}% (Base: 18%)
              </span>
            </div>

            <div className="bg-surface p-3.5 rounded-lg border border-border">
              <span className="text-xs text-ink-muted block">Hub Payback Period:</span>
              <span className="font-mono font-bold text-xl text-accent">
                {results.paybackYears.toFixed(1)} Years
              </span>
              <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">
                Base: 2.6 Years (Capex: ₹25L)
              </span>
            </div>

            <div className="bg-surface p-3.5 rounded-lg border border-border">
              <span className="text-xs text-ink-muted block">Network Capital ROI:</span>
              <span className="font-mono font-bold text-xl text-ink">
                {results.year4EbitdaCrore > 0 ? `${Math.round((results.year4EbitdaCrore / 6.25) * 100)}%` : '0%'}
              </span>
              <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">
                On ₹6.25 Cr Net Capex
              </span>
            </div>
          </div>

          <div className="p-3 bg-surface border border-border rounded-lg text-xs text-ink-muted">
            Stress Test Resilience: Even under <strong>-20% harvest volume</strong> and <strong>consumer price drop to ₹18/kg</strong>, Year 4 EBITDA remains profitable (+9%) and payback is achieved within 3.6 years.
          </div>
        </div>
      </div>
    </div>
  );
};
