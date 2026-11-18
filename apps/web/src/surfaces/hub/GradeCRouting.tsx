import React, { useState } from 'react';
import { Badge, Button } from '@farmgate/ui';
import {
  Recycle,
  CheckCircle2,
  DollarSign,
  Factory,
  Sun,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const GradeCRouting: React.FC = () => {
  const [routedSuccess, setRoutedSuccess] = useState(false);

  const gradeCInventoryKg = 180;
  const processingRateKg = 4.5;
  const grossRecovery = gradeCInventoryKg * processingRateKg; // ₹810

  const handleRoute = () => {
    setRoutedSuccess(true);
    setTimeout(() => setRoutedSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Circular Agritech: Spoilage Zero</span>
          <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
            Grade-C Waste-to-Value Routing
            <Badge variant="accent">CIRCULAR VALUE</Badge>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-ink">Blemished & Soft Tomato Processing Stream</h3>
            <p className="text-xs text-ink-muted leading-relaxed mt-1">
              Tomatoes that fail Grade A/B retail table standards are not dumped in the field. FarmGate Hub aggregates them for localized solar dehydration and puree processors at a floor of ₹4.50/kg.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-ink">Current Grade-C Inventory in Hub:</span>
              <span className="font-mono font-bold text-accent text-sm">{gradeCInventoryKg} kg</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-surface-elevated p-3 rounded-lg border border-border">
              <div>
                <span className="text-ink-muted block text-[10px]">RECOVERY RATE:</span>
                <span className="font-bold text-accent">₹{processingRateKg.toFixed(2)} / kg</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px]">TOTAL VALUE SAVED:</span>
                <span className="font-bold text-ink">₹{grossRecovery.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[11px] text-ink-muted">
              Alternative Mandi Outcome: <strong>100% loss (₹0 return)</strong> dumped at farm gate.
            </p>
          </div>

          {routedSuccess && (
            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs text-accent-ink space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-accent">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>180 kg Dispatched to Kolar Solar Dehydration Co-op!</span>
              </div>
              <p className="font-mono text-[11px]">
                ₹810 credited to farmer cooperative pool. Zero physical food waste.
              </p>
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleRoute}
            className="w-full min-h-[48px] font-bold text-sm flex items-center justify-center gap-2"
          >
            <Recycle className="w-4 h-4" />
            <span>Route 180 kg to Solar Dehydrator (₹810 Recovery)</span>
          </Button>
        </div>

        <div className="lg:col-span-5 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
            <Factory className="w-4 h-4 text-accent" />
            <span>Verified Local Processors</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
              <div className="flex justify-between font-bold text-ink">
                <span>Kolar Solar Dehydration Co-op</span>
                <span className="text-accent font-mono">₹4.50/kg</span>
              </div>
              <p className="text-[11px] text-ink-muted">Distance: 3.2 km • Sun-dried tomato flakes</p>
            </div>

            <div className="p-3 bg-surface rounded-lg border border-border space-y-1">
              <div className="flex justify-between font-bold text-ink">
                <span>Sahyadri Agro Puree & Pulp</span>
                <span className="text-accent font-mono">₹4.20/kg</span>
              </div>
              <p className="text-[11px] text-ink-muted">Distance: 8.5 km • Bulk aseptic tomato paste</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
