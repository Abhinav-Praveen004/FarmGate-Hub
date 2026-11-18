import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '@farmgate/ui';
import {
  Recycle,
  CheckCircle2,
  Factory,
  Sun,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface Processor {
  id: string;
  name: string;
  rateRupeesKg: number;
  product: string;
  distanceKm: number;
  capacityKgDay: number;
  sla: string;
}

const VERIFIED_PROCESSORS: Processor[] = [
  {
    id: 'proc_kolar',
    name: 'Kolar Solar Dehydration Co-op',
    rateRupeesKg: 4.5,
    product: 'Sun-dried tomato flakes',
    distanceKm: 3.2,
    capacityKgDay: 500,
    sla: 'Pickup today at 17:00',
  },
  {
    id: 'proc_sahyadri',
    name: 'Sahyadri Agro Puree & Pulp',
    rateRupeesKg: 4.2,
    product: 'Bulk aseptic tomato paste',
    distanceKm: 8.5,
    capacityKgDay: 2000,
    sla: 'Immediate tanker dispatch',
  },
];

interface DispatchRecord {
  id: string;
  processor: string;
  product: string;
  weightKg: number;
  rateRupeesKg: number;
  totalRecoveryRupees: number;
  timestamp: string;
  status: string;
}

export const GradeCRouting: React.FC = () => {
  const [selectedProcessorId, setSelectedProcessorId] = useState<string>('proc_kolar');
  const [inventoryKg, setInventoryKg] = useState<number>(180);
  const [routeWeightKg, setRouteWeightKg] = useState<number>(180);
  const [cumulativeDivertedKg, setCumulativeDivertedKg] = useState<number>(1420);
  const [cumulativeRescuedRupees, setCumulativeRescuedRupees] = useState<number>(6390);
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([
    {
      id: 'GC-BATCH-07',
      processor: 'Sahyadri Agro Puree & Pulp',
      product: 'Bulk aseptic tomato paste',
      weightKg: 240,
      rateRupeesKg: 4.2,
      totalRecoveryRupees: 1008,
      timestamp: 'Today 11:30 AM',
      status: 'DELIVERED',
    },
    {
      id: 'GC-BATCH-06',
      processor: 'Kolar Solar Dehydration Co-op',
      product: 'Sun-dried tomato flakes',
      weightKg: 150,
      rateRupeesKg: 4.5,
      totalRecoveryRupees: 675,
      timestamp: 'Yesterday 16:45 PM',
      status: 'DELIVERED',
    },
  ]);
  const [isRouting, setIsRouting] = useState(false);
  const [recentSuccess, setRecentSuccess] = useState<DispatchRecord | null>(null);

  // Sync with API if running
  useEffect(() => {
    fetch('/api/hub/grade-c')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setInventoryKg(data.inventoryKg);
          setRouteWeightKg(data.inventoryKg);
          setCumulativeDivertedKg(data.cumulativeDivertedKg);
          setCumulativeRescuedRupees(data.cumulativeRescuedRupees);
          if (data.dispatches && data.dispatches.length > 0) {
            setDispatches(data.dispatches);
          }
        }
      })
      .catch(() => {});
  }, []);

  const selectedProcessor =
    VERIFIED_PROCESSORS.find((p) => p.id === selectedProcessorId) || VERIFIED_PROCESSORS[0];

  const currentRouteWeight = Math.min(routeWeightKg, inventoryKg);
  const grossRecovery = currentRouteWeight * selectedProcessor.rateRupeesKg;

  const handleRoute = async () => {
    if (currentRouteWeight <= 0) return;
    setIsRouting(true);

    try {
      const res = await fetch('/api/hub/grade-c/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processor: selectedProcessor.name,
          product: selectedProcessor.product,
          rateRupeesKg: selectedProcessor.rateRupeesKg,
          weightKg: currentRouteWeight,
        }),
      });
      const data = await res.json();
      if (data.success && data.dispatch) {
        setRecentSuccess(data.dispatch);
        setInventoryKg(data.updatedState.inventoryKg);
        setRouteWeightKg(data.updatedState.inventoryKg);
        setCumulativeDivertedKg(data.updatedState.cumulativeDivertedKg);
        setCumulativeRescuedRupees(data.updatedState.cumulativeRescuedRupees);
        setDispatches(data.updatedState.dispatches);
      }
    } catch {
      // Local fallback simulation
      const newRec: DispatchRecord = {
        id: `GC-BATCH-0${dispatches.length + 8}`,
        processor: selectedProcessor.name,
        product: selectedProcessor.product,
        weightKg: currentRouteWeight,
        rateRupeesKg: selectedProcessor.rateRupeesKg,
        totalRecoveryRupees: grossRecovery,
        timestamp: 'Just now',
        status: 'IN TRANSIT',
      };
      setRecentSuccess(newRec);
      setInventoryKg((prev) => Math.max(0, prev - currentRouteWeight));
      setRouteWeightKg((prev) => Math.max(0, prev - currentRouteWeight));
      setCumulativeDivertedKg((prev) => prev + currentRouteWeight);
      setCumulativeRescuedRupees((prev) => prev + grossRecovery);
      setDispatches((prev) => [newRec, ...prev]);
    } finally {
      setIsRouting(false);
    }
  };

  const handleRestock = async () => {
    try {
      const res = await fetch('/api/hub/grade-c/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addKg: 60 }),
      });
      const data = await res.json();
      if (data.inventoryKg) {
        setInventoryKg(data.inventoryKg);
        setRouteWeightKg(data.inventoryKg);
      }
    } catch {
      setInventoryKg((prev) => prev + 60);
      setRouteWeightKg((prev) => prev + 60);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Circular Badge */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Circular Agritech: Spoilage Zero</span>
          <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            Grade-C Waste-to-Value Routing
            <Badge variant="accent">CIRCULAR VALUE</Badge>
          </h2>
        </div>

        <Link
          to="/impact"
          className="text-xs font-bold text-accent hover:underline flex items-center gap-1.5 p-2 rounded-lg bg-accent/5 border border-accent/20"
        >
          <span>View Spoilage KPIs in Impact Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top 3 Circular Economy Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-surface-elevated border border-border rounded-xl">
          <div className="flex items-center justify-between text-ink-muted text-xs">
            <span>Food Waste Diverted</span>
            <Recycle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 font-mono font-bold text-xl text-ink">
            {cumulativeDivertedKg.toLocaleString('en-IN')} kg
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Zero field rot • 100% processed</p>
        </div>

        <div className="p-4 bg-surface-elevated border border-border rounded-xl">
          <div className="flex items-center justify-between text-ink-muted text-xs">
            <span>Farmer Revenue Rescued</span>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-1 font-mono font-bold text-xl text-accent">
            ₹{cumulativeRescuedRupees.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Direct credit to FPO farmer pool</p>
        </div>

        <div className="p-4 bg-surface-elevated border border-border rounded-xl">
          <div className="flex items-center justify-between text-ink-muted text-xs">
            <span>CO₂e Methane Avoided</span>
            <Sun className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 font-mono font-bold text-xl text-ink">
            {(cumulativeDivertedKg * 0.0013).toFixed(2)} tCO₂e
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Equivalent to {(cumulativeDivertedKg * 0.0013 * 42).toFixed(0)} tree-years</p>
        </div>
      </div>

      {/* Main 2-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inventory & Dispatch Stream (7 cols) */}
        <div className="lg:col-span-7 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-ink">Blemished & Soft Tomato Processing Stream</h3>
              <p className="text-xs text-ink-muted leading-relaxed mt-1">
                Tomatoes that fail Grade A/B retail table standards are not dumped in the field. FarmGate Hub aggregates them for localized solar dehydration and puree processors at a floor of ₹4.20–₹4.50/kg.
              </p>
            </div>
          </div>

          {/* Live Inventory Box */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-ink">Current Grade-C Inventory in Hub:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-accent text-base">{inventoryKg} kg</span>
                <button
                  onClick={handleRestock}
                  title="Simulate Grade-C intake from sorting"
                  className="px-2 py-0.5 rounded text-[11px] bg-surface-elevated hover:bg-border text-ink-muted border border-border flex items-center gap-1 font-sans"
                >
                  <PlusCircle className="w-3 h-3 text-accent" />
                  <span>+60 kg intake</span>
                </button>
              </div>
            </div>

            {/* Weight Allocation Buttons */}
            {inventoryKg > 0 ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-ink-muted">
                  <span>Batch Weight to Route:</span>
                  <span className="font-mono font-bold text-ink">{currentRouteWeight} kg</span>
                </div>
                <div className="flex items-center gap-2">
                  {[50, 100, inventoryKg].map((w) => (
                    <button
                      key={w}
                      onClick={() => setRouteWeightKg(w)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                        currentRouteWeight === w
                          ? 'border-accent bg-accent/10 text-accent ring-1 ring-accent'
                          : 'border-border bg-surface-elevated text-ink hover:border-border-strong'
                      }`}
                    >
                      {w === inventoryKg ? `All (${w} kg)` : `${w} kg`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All Grade-C inventory dispatched! Zero food waste achieved for this cycle.</span>
              </div>
            )}

            {/* Financial Value Box */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-surface-elevated p-3 rounded-lg border border-border">
              <div>
                <span className="text-ink-muted block text-[10px]">SELECTED PROCESSOR RATE:</span>
                <span className="font-bold text-accent">₹{selectedProcessor.rateRupeesKg.toFixed(2)} / kg</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px]">ESTIMATED VALUE RESCUED:</span>
                <span className="font-bold text-ink">₹{grossRecovery.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
              <span className="font-bold shrink-0">Baseline Comparison:</span>
              <span>Traditional Mandi Outcome: <strong>100% loss (₹0 return)</strong> dumped at farm gate.</span>
            </div>
          </div>

          {/* Success Banner */}
          {recentSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Batch #{recentSuccess.id}: {recentSuccess.weightKg} kg Dispatched to {recentSuccess.processor}!
                  </span>
                </div>
                <Badge variant="success" size="sm">IN TRANSIT</Badge>
              </div>
              <p className="font-mono text-[11px] text-emerald-700">
                ₹{recentSuccess.totalRecoveryRupees.toFixed(2)} credited to farmer cooperative pool. Zero physical food waste.
              </p>
            </div>
          )}

          {/* Dispatch Action Button */}
          <Button
            variant="primary"
            onClick={handleRoute}
            disabled={isRouting || inventoryKg === 0}
            className="w-full min-h-[50px] font-bold text-sm flex items-center justify-center gap-2"
          >
            <Recycle className="w-4 h-4" />
            <span>
              {isRouting
                ? 'Routing Batch & Crediting Pool...'
                : inventoryKg === 0
                ? 'Inventory Cleared (Click "+60 kg intake" to test again)'
                : `Route ${currentRouteWeight} kg to ${selectedProcessor.name} (₹${grossRecovery.toFixed(0)} Recovery)`}
            </span>
          </Button>
        </div>

        {/* Right Column: Verified Local Processors (5 cols) */}
        <div className="lg:col-span-5 bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-accent" />
              <span>Verified Local Processors (2)</span>
            </h3>
            <span className="text-[11px] text-ink-muted">Click to select</span>
          </div>

          <div className="space-y-3 text-xs">
            {VERIFIED_PROCESSORS.map((processor) => {
              const isSelected = processor.id === selectedProcessorId;
              return (
                <button
                  key={processor.id}
                  onClick={() => setSelectedProcessorId(processor.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/5 ring-1 ring-accent'
                      : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-ink text-sm">{processor.name}</span>
                        {isSelected && <Badge variant="success" size="sm">ACTIVE</Badge>}
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        Distance: {processor.distanceKm} km • {processor.product}
                      </p>
                    </div>
                    <span className="text-base font-mono font-bold text-accent">
                      ₹{processor.rateRupeesKg.toFixed(2)}/kg
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-ink-muted font-mono">
                    <span>Capacity: {processor.capacityKgDay} kg/day</span>
                    <span className="text-accent font-semibold">{processor.sla}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Processing Stream Info Card */}
          <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2 text-xs">
            <span className="font-bold text-ink block text-[11px]">How Grade-C Waste-to-Value Works:</span>
            <ul className="space-y-1.5 text-[11px] text-ink-muted list-disc list-inside">
              <li>Soft/blemished tomatoes are separated during digital optical intake grading.</li>
              <li>Consolidated at the hub into 100 kg–250 kg processing crates.</li>
              <li>Local solar dehydration dryers turn produce into flakes and powder with a 1-year shelf life.</li>
              <li>Puree facilities process remaining bulk lots into institutional food-service paste.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dispatched Processing Batches History */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-ink">Recent Circular Processing Dispatches</h3>
          </div>
          <span className="text-xs font-mono text-ink-muted">Double-Entry Ledger Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-ink-muted font-mono uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Batch ID</th>
                <th className="py-2.5 px-3">Processor</th>
                <th className="py-2.5 px-3">Product Stream</th>
                <th className="py-2.5 px-3 text-right">Weight</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Total Rescued</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {dispatches.map((item) => (
                <tr key={item.id} className="hover:bg-surface transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-ink">{item.id}</td>
                  <td className="py-3 px-3 font-semibold text-ink">{item.processor}</td>
                  <td className="py-3 px-3 text-ink-muted">{item.product}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-ink">{item.weightKg} kg</td>
                  <td className="py-3 px-3 text-right font-mono text-accent">₹{item.rateRupeesKg.toFixed(2)}/kg</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">₹{item.totalRecoveryRupees.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-ink-muted text-[11px]">{item.timestamp}</td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={item.status === 'DELIVERED' ? 'neutral' : 'success'} size="sm">
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
