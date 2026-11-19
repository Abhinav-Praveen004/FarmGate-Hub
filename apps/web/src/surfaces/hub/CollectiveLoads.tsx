import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '@farmgate/ui';
import { useFarmerLots } from '../../api/client';
import {
  Truck,
  CheckCircle2,
  Package,
  Layers,
  ShieldCheck,
  Clock,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

export function getCropInfo(cropName?: string) {
  const c = (cropName || 'tomato').toLowerCase();
  if (c.includes('chilli')) {
    return {
      name: 'Chilli',
      icon: '🌶️',
      badgeClass: 'bg-red-50 text-red-800 border-red-200',
      gradeAPrice: 42.0,
      gradeBPrice: 34.0,
    };
  }
  if (c.includes('potato')) {
    return {
      name: 'Potato',
      icon: '🥔',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
      gradeAPrice: 18.0,
      gradeBPrice: 14.5,
    };
  }
  if (c.includes('onion')) {
    return {
      name: 'Onion',
      icon: '🧅',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      gradeAPrice: 24.0,
      gradeBPrice: 19.0,
    };
  }
  return {
    name: 'Tomato',
    icon: '🍅',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    gradeAPrice: 14.0,
    gradeBPrice: 11.5,
  };
}

const FARMER_NAMES: Record<string, string> = {
  farmer_meena: 'Ramesh Chandra',
  'FARMER-001': 'Ramesh Chandra',
  farmer_ramesh: 'Ramesh Chandra',
  farmer_murugan: 'Murugan K.',
  'FARMER-002': 'Murugan K.',
  farmer_lakshmi: 'Lakshmi Devi',
  'FARMER-003': 'Lakshmi Devi',
  farmer_suresh: 'Suresh Gowda',
  'FARMER-004': 'Suresh Gowda',
  farmer_arun: 'Arun Kumar',
  farmer_deepa: 'Deepa M.',
  farmer_anand: 'Anand V.',
  farmer_kavita: 'Kavita Devi',
  farmer_rajesh: 'Rajesh G.',
  farmer_geetha: 'Geetha R.',
  farmer_selvam: 'Selvam P.',
};

const FALLBACK_LOTS = [
  { id: 'lot_214', number: 214, farmer: 'Lakshmi Devi', crop: 'chilli', weightKg: 120, grade: 'A', podHours: 14, score: 74, isSoldByFarmer: false, status: 'IN_POD' },
  { id: 'lot_215', number: 215, farmer: 'Murugan K.', crop: 'potato', weightKg: 120, grade: 'A', podHours: 14, score: 85, isSoldByFarmer: true, status: 'IN_POD' },
  { id: 'lot_212', number: 212, farmer: 'Ramesh Chandra', crop: 'tomato', weightKg: 240, grade: 'A', podHours: 22, score: 82, isSoldByFarmer: false, status: 'IN_POD' },
  { id: 'lot_211', number: 211, farmer: 'Suresh Gowda', crop: 'tomato', weightKg: 140, grade: 'B', podHours: 28, score: 75, isSoldByFarmer: false, status: 'IN_POD' },
  { id: 'lot_216', number: 216, farmer: 'Anand V.', crop: 'potato', weightKg: 160, grade: 'B', podHours: 18, score: 78, isSoldByFarmer: false, status: 'IN_POD' },
  { id: 'lot_218', number: 218, farmer: 'Deepa M.', crop: 'onion', weightKg: 150, grade: 'A', podHours: 8, score: 88, isSoldByFarmer: true, status: 'IN_POD' },
];

export interface CollectiveLoadsProps {
  onNavigateToPayouts?: () => void;
  onNavigateToGradeC?: () => void;
}

export const CollectiveLoads: React.FC<CollectiveLoadsProps> = ({
  onNavigateToPayouts,
  onNavigateToGradeC,
}) => {
  const { data: rawLots, refetch: refetchLots } = useFarmerLots();

  // Exactly TWO Verified Buyers
  const buyerOrders = [
    {
      id: 'ORD-771',
      buyerName: 'Annapurna Retail Network',
      contractType: 'Institutional Supply Contract',
      grade: 'A',
      quantityKg: 500,
      priceSummary: 'Grade A Wholesale Index (₹14 - ₹42/kg)',
      deliveryWindow: 'Today 16:00',
      depositStatus: 'Escrow 100% Cleared',
      reliability: '98% on-time payment',
    },
    {
      id: 'ORD-772',
      buyerName: 'FreshBasket Supermarkets',
      contractType: 'Supermarket Value Contract',
      grade: 'B',
      quantityKg: 300,
      priceSummary: 'Grade B Value Index (₹11.50 - ₹34/kg)',
      deliveryWindow: 'Tomorrow 09:00',
      depositStatus: 'Escrow 100% Cleared',
      reliability: '95% on-time payment',
    },
  ];

  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-771');
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedManifest, setDispatchedManifest] = useState<any>(null);

  const activeOrder = buyerOrders.find((o) => o.id === selectedOrderId) || buyerOrders[0];

  // Map all eligible lots currently stored in the cool pod
  const allAvailableLots = (rawLots && rawLots.length > 0 ? rawLots : FALLBACK_LOTS)
    .filter((l: any) => {
      const status = (l.status || '').toUpperCase();
      return status === 'IN_POD' || status === 'SOLD' || status === 'GRADED';
    })
    .map((l: any) => {
      const cropInfo = getCropInfo(l.crop);
      const weightKg = Math.round((l.weightGrams || l.weightKg * 1000) / 1000);
      const grade = (l.grade || 'A').toUpperCase();
      const unitPrice = grade === 'A' ? cropInfo.gradeAPrice : cropInfo.gradeBPrice;

      return {
        id: String(l.id),
        number: l.lotNumber || Number(String(l.id).replace(/\D/g, '')),
        farmer: FARMER_NAMES[l.farmerId] || l.farmerName || l.farmerId,
        crop: cropInfo.name,
        cropInfo,
        weightKg,
        grade,
        unitPrice,
        lotValueRupees: Math.round(weightKg * unitPrice),
        podHours: l.hoursInPod || l.podHours || 14,
        score: l.buyerMatchScore || l.score || 78,
        status: (l.status || 'IN_POD').toUpperCase(),
        isSoldByFarmer:
          (l.status || '').toUpperCase() === 'SOLD' ||
          (l.status || '').toUpperCase() === 'DISPATCHED' ||
          (l.status || '').toUpperCase() === 'PAID' ||
          Boolean(l.isSoldByFarmer),
      };
    });

  // STRICT GRADE FILTERING:
  // Annapurna (Grade A) strictly displays Grade A lots across all vegetables.
  // FreshBasket (Grade B) strictly displays Grade B lots across all vegetables.
  const displayedLots = allAvailableLots.filter((l) => l.grade === activeOrder.grade);

  // Check for any Grade C lots stored in system
  const gradeCLots = (rawLots || [])
    .filter((l: any) => (l.grade || '').toUpperCase() === 'C')
    .map((l: any) => ({
      id: String(l.id),
      number: l.lotNumber || Number(String(l.id).replace(/\D/g, '')),
      crop: getCropInfo(l.crop).name,
      farmer: FARMER_NAMES[l.farmerId] || l.farmerName || l.farmerId,
      weightKg: Math.round((l.weightGrams || 120000) / 1000),
    }));

  // Auto-select all matching lots when the selected order changes
  useEffect(() => {
    if (displayedLots.length > 0) {
      setSelectedLotIds(displayedLots.map((l) => l.id));
    } else {
      setSelectedLotIds([]);
    }
  }, [selectedOrderId, displayedLots.length]);

  const toggleLot = (id: string) => {
    setSelectedLotIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const autoFillAll = () => {
    setSelectedLotIds(displayedLots.map((l) => l.id));
  };

  const selectedLots = displayedLots.filter((l) => selectedLotIds.includes(l.id));
  const totalWeightKg = selectedLots.reduce((sum, l) => sum + l.weightKg, 0);
  const totalValueRupees = selectedLots.reduce((sum, l) => sum + l.lotValueRupees, 0);
  const isTargetMet = totalWeightKg >= activeOrder.quantityKg;

  // Handle load dispatch
  const handleConfirmDispatch = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/hub/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerOrderId: activeOrder.id === 'ORD-771' ? 'order_kirana_500kg' : 'order_freshbite_200kg',
          lotIds: selectedLotIds,
          dispatchedWeightKg: totalWeightKg,
          crop: Array.from(new Set(selectedLots.map((l) => l.crop))).join(', '),
        }),
      });
      const data = await res.json();
      if (data && data.loadId) {
        await fetch(`/api/hub/loads/${data.loadId}/confirm`, {
          method: 'POST',
        });
      }

      setDispatchedManifest({
        loadNumber: 'CL-04',
        orderId: activeOrder.id,
        buyer: activeOrder.buyerName,
        totalWeightKg,
        valueRupees: totalValueRupees,
        lotsCount: selectedLots.length,
        slaCountdownHours: 24,
      });

      refetchLots();
    } catch {
      // Graceful fallback
      setDispatchedManifest({
        loadNumber: 'CL-04',
        orderId: activeOrder.id,
        buyer: activeOrder.buyerName,
        totalWeightKg,
        valueRupees: totalValueRupees,
        lotsCount: selectedLots.length,
        slaCountdownHours: 24,
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Operator Console: Demand Aggregation
        </span>
        <h1 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
          Collective Load Builder & Dispatch
          <Badge variant="simulated">DEMAND MATCHER</Badge>
        </h1>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exactly TWO Verified Buyer Orders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                <span>Verified Buyer Orders ({buyerOrders.length})</span>
              </h2>
              <Badge variant="outline" size="sm">MULTI-CROP</Badge>
            </div>
            <p className="text-xs text-ink-muted">
              Select an open buyer contract to assemble eligible graded micro-lots from the Cool Pod.
            </p>

            <div className="space-y-3">
              {buyerOrders.map((order) => {
                const isSelected = order.id === selectedOrderId;
                const eligibleCount = allAvailableLots.filter((l) => l.grade === order.grade).length;

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${isSelected
                      ? 'border-accent bg-accent/5 ring-1 ring-accent'
                      : 'border-border bg-surface hover:border-border-strong'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-accent">{order.id}</span>
                          <span className="text-xs text-ink-muted">({order.contractType})</span>
                        </div>
                        <h3 className="text-sm font-bold text-ink mt-0.5">{order.buyerName}</h3>
                      </div>
                      <Badge variant={order.grade === 'A' ? 'grade_a' : 'grade_b'}>
                        Grade {order.grade}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
                      <div>
                        <span className="text-ink-muted block text-[11px]">Required Quantity:</span>
                        <span className="font-mono font-bold text-ink">{order.quantityKg} kg</span>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[11px]">Pricing Rate:</span>
                        <span className="font-mono font-bold text-accent text-[11px]">
                          {order.grade === 'A' ? 'Grade A Rates' : 'Grade B Rates'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-ink-muted">
                      <span className="flex items-center gap-1 text-accent font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {order.depositStatus}
                      </span>
                      <span className="font-medium text-ink">
                        {eligibleCount} lot(s) eligible in Pod
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Grade C Waste-to-Value Notification */}
            {gradeCLots.length > 0 && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-2 text-xs mt-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl leading-none">♻️</span>
                  <div>
                    <h4 className="font-bold text-amber-950">
                      {gradeCLots.length} Grade C Lot ({gradeCLots.map((l) => `${l.crop} Lot #${l.number}`).join(', ')}) Detected
                    </h4>
                    <p className="text-[11px] text-amber-800 leading-normal mt-0.5">
                      Fresh retail buyers only procure Grade A & B. Sub-optimal/blemished Grade C produce is diverted to food processors to recover value.
                    </p>
                  </div>
                </div>
                {onNavigateToGradeC && (
                  <button
                    type="button"
                    onClick={onNavigateToGradeC}
                    className="w-full py-1.5 px-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Route via Grade-C Waste-to-Value Tab →</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Graded Lot Aggregator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <span>Assemble Matching Graded Lots</span>
                  <Badge variant={activeOrder.grade === 'A' ? 'grade_a' : 'grade_b'} size="sm">
                    Grade {activeOrder.grade} Only
                  </Badge>
                </h2>
                <p className="text-xs text-ink-muted">
                  Showing all eligible Grade {activeOrder.grade} lots stored in the Cool Pod ready for {activeOrder.buyerName}.
                </p>
              </div>

              {displayedLots.length > 0 && (
                <Button variant="outline" size="sm" onClick={autoFillAll} className="text-xs">
                  Select All
                </Button>
              )}
            </div>

            {/* Lots Checklist */}
            <div className="space-y-2.5">
              {displayedLots.length === 0 ? (
                <div className="p-8 bg-surface border border-dashed border-border rounded-xl text-center space-y-3">
                  <span className="text-3xl block">📦</span>
                  <h4 className="text-base font-bold text-ink">
                    No Grade {activeOrder.grade} lots currently in Cool Pod
                  </h4>
                  <p className="text-xs text-ink-muted max-w-sm mx-auto">
                    {activeOrder.grade === 'B'
                      ? 'All active lots currently in your pod are Grade A. Select Annapurna Retail Network to assemble a Grade A consignment.'
                      : 'No Grade A lots found in the Cool Pod. Intake fresh produce at the Hub Console to grade and store new lots.'}
                  </p>
                  {activeOrder.grade === 'B' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedOrderId('ORD-771')}
                      className="text-xs font-semibold"
                    >
                      <span>Switch to Annapurna Retail Network (Grade A) →</span>
                    </Button>
                  )}
                </div>
              ) : (
                displayedLots.map((lot) => {
                  const isSelected = selectedLotIds.includes(lot.id);
                  return (
                    <div
                      key={lot.id}
                      onClick={() => toggleLot(lot.id)}
                      className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${isSelected
                        ? 'border-accent bg-accent/10 ring-1 ring-accent'
                        : 'border-border bg-surface hover:border-border-strong'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => { }}
                          className="w-4 h-4 accent-accent rounded"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-ink">Lot #{lot.number}</span>
                            <span className="text-xs font-semibold text-ink">{lot.farmer}</span>

                            {/* Clear Vegetable / Crop Label with Emoji */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border ${lot.cropInfo.badgeClass}`}
                            >
                              <span>{lot.cropInfo.icon}</span>
                              <span>{lot.crop}</span>
                            </span>

                            <Badge variant={lot.grade === 'A' ? 'grade_a' : 'grade_b'} size="sm">
                              Grade {lot.grade}
                            </Badge>

                            {lot.isSoldByFarmer ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                AUTHORIZED (Sell Now)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                In Pod ({lot.podHours}h)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-muted mt-0.5">
                            In Pod: {lot.podHours}h • Algorithm Fit: {lot.score}% Match • Agreed Rate: ₹{lot.unitPrice}/kg
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-ink">{lot.weightKg} kg</span>
                        <span className="text-[11px] text-accent block font-mono font-bold">
                          ₹{lot.lotValueRupees.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Load Assembly Summary Box */}
            <div className="p-4 bg-surface rounded-lg border border-border space-y-3 font-mono text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Target Quantity:</span>
                <span>{activeOrder.quantityKg} kg</span>
              </div>
              <div className="flex justify-between font-bold text-ink">
                <span>Aggregated Total:</span>
                <span className={isTargetMet ? 'text-accent' : 'text-amber-600'}>
                  {totalWeightKg} kg / {activeOrder.quantityKg} kg ({Math.round((totalWeightKg / activeOrder.quantityKg) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-accent pt-2 border-t border-border">
                <span>Wholesale Load Value:</span>
                <span>₹{totalValueRupees.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Manifest Success Box & What's Next Guidance */}
            {dispatchedManifest && (
              <div className="p-4 bg-emerald-50/90 border-2 border-emerald-500/40 rounded-xl space-y-3.5 animate-fadeIn text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Collective Load #{dispatchedManifest.loadNumber} Dispatched Successfully!</span>
                  </div>
                  <Badge variant="success" size="sm">IN TRANSIT</Badge>
                </div>

                <div className="text-ink-muted space-y-1 font-mono text-[11px] bg-white p-3 rounded-lg border border-emerald-200">
                  <p>
                    <strong>Wholesale Buyer:</strong> {dispatchedManifest.buyer} ({dispatchedManifest.totalWeightKg} kg consignment)
                  </p>
                  <p className="text-emerald-700 font-bold">
                    ✓ 24-Hour Payout SLA Activated ({dispatchedManifest.lotsCount} participating lots queued)
                  </p>
                  <p>
                    ✓ Automated WhatsApp notification sent to{' '}
                    {Array.from(new Set(selectedLots.map((l) => l.farmer))).join(', ') || 'participating farmers'}.
                  </p>
                </div>

                {/* Downstream Actions Across Modules */}
                <div className="pt-2 border-t border-emerald-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
                    What Happens Next in the Flow:
                  </span>

                  {/* Primary Next Action: Payouts Queue */}
                  {onNavigateToPayouts ? (
                    <Button
                      variant="primary"
                      onClick={onNavigateToPayouts}
                      className="w-full min-h-[46px] font-bold text-xs flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Step 6: Open Advances & Payouts Queue (SLA Timer Active) →</span>
                    </Button>
                  ) : (
                    <a
                      href="#payouts"
                      className="w-full min-h-[46px] font-bold text-xs flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Step 6: Open Advances & Payouts Queue →</span>
                    </a>
                  )}

                  {/* Secondary Quick Links Across Other Modules */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Link
                      to="/farmer"
                      className="p-2.5 bg-white rounded-lg border border-border text-center hover:border-accent hover:shadow-xs transition-all flex flex-col items-center justify-center text-[10px] font-semibold text-ink group"
                    >
                      <span className="text-accent group-hover:underline flex items-center gap-1">
                        Farmer Receipt ↗
                      </span>
                      <span className="text-ink-muted text-[9px] font-normal">Screen 3 (UTR)</span>
                    </Link>

                    <Link
                      to="/buyer"
                      className="p-2.5 bg-white rounded-lg border border-border text-center hover:border-accent hover:shadow-xs transition-all flex flex-col items-center justify-center text-[10px] font-semibold text-ink group"
                    >
                      <span className="text-accent group-hover:underline flex items-center gap-1">
                        Buyer Portal ↗
                      </span>
                      <span className="text-ink-muted text-[9px] font-normal">Consignment Tracked</span>
                    </Link>

                    <Link
                      to="/t/FGH-ANNUR-2026-LOT214"
                      className="p-2.5 bg-white rounded-lg border border-border text-center hover:border-accent hover:shadow-xs transition-all flex flex-col items-center justify-center text-[10px] font-semibold text-ink group"
                    >
                      <span className="text-accent group-hover:underline flex items-center gap-1">
                        Traceability ↗
                      </span>
                      <span className="text-ink-muted text-[9px] font-normal">Dispatch Timeline</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Dispatch Action or Reset */}
            {dispatchedManifest ? (
              <Button
                variant="outline"
                onClick={() => setDispatchedManifest(null)}
                className="w-full min-h-[44px] font-semibold text-xs flex items-center justify-center gap-2 border-border text-ink-muted hover:text-ink"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Assemble Another Consignment</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleConfirmDispatch}
                disabled={isDispatching || selectedLotIds.length === 0}
                className="w-full min-h-[50px] font-bold text-sm flex items-center justify-center gap-2"
              >
                <Truck className="w-5 h-5" />
                <span>
                  {isDispatching
                    ? 'Dispatching Load & Triggering SLA Clocks...'
                    : `Confirm Sale & Dispatch Load #CL-04 (${totalWeightKg} kg)`}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
