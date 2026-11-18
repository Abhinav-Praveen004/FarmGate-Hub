import React, { useState } from 'react';
import { Badge, Button } from '@farmgate/ui';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  ShieldCheck,
  QrCode as QrIcon,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Layers,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRupees, formatWeightKg } from '@farmgate/shared';

interface BuyerLot {
  id: string;
  number: number;
  farmer: string;
  weightKg: number;
  qrCode: string;
}

interface BuyerOrder {
  orderId: string;
  loadNumber: string;
  buyerName: string;
  crop: string;
  grade: string;
  quantityKg: number;
  priceRupeesKg: number;
  totalEscrowRupees: number;
  savingsRupees: number;
  origin: string;
  destination: string;
  vehicle: string;
  eta: string;
  status: string;
  depositStatus: string;
  progressPercent: number;
  lots: BuyerLot[];
}

const DEFAULT_ORDERS: BuyerOrder[] = [
  {
    orderId: 'ORD-771',
    loadNumber: 'CL-04',
    buyerName: 'Annapurna Kirana Network',
    crop: 'Hybrid Tomato',
    grade: 'Grade A',
    quantityKg: 500,
    priceRupeesKg: 14.0,
    totalEscrowRupees: 7000,
    savingsRupees: 1000,
    origin: 'Kolar Hub #01',
    destination: 'Annapurna DC, Whitefield',
    vehicle: 'Truck TN-38-K-4412 (Insulated 11.5°C)',
    eta: 'Today 16:30',
    status: 'IN TRANSIT • ESCROW LOCKED',
    depositStatus: 'Escrow 100% Cleared',
    progressPercent: 75,
    lots: [
      { id: 'lot_214', number: 214, farmer: 'Ramesh Chandra (Annur)', weightKg: 120, qrCode: 'FGH-ANNUR-2026-LOT214' },
      { id: 'lot_212', number: 212, farmer: 'Murugan K. (Kolar)', weightKg: 240, qrCode: 'FGH-KOLAR-2026-LOT212' },
      { id: 'lot_210', number: 210, farmer: 'Suresh Gowda (Hoskote)', weightKg: 140, qrCode: 'FGH-HOSKOTE-2026-LOT210' },
    ],
  },
];

export const BuyerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'traceability'>('catalog');
  const [orderQuantityKg, setOrderQuantityKg] = useState<number>(500);
  const [escrowDeposited, setEscrowDeposited] = useState<boolean>(true);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [orders, setOrders] = useState<BuyerOrder[]>(DEFAULT_ORDERS);

  const pricePerKg = 14.0;
  const mandiBenchmarkKg = 16.0;
  const totalCost = orderQuantityKg * pricePerKg;
  const mandiCost = orderQuantityKg * mandiBenchmarkKg;
  const buyerSavings = mandiCost - totalCost; // e.g. ₹1,000 savings (12.5%)

  const handlePlaceOrder = () => {
    const newOrderId = `ORD-${Math.floor(773 + Math.random() * 50)}`;
    const newLoadNum = `CL-0${orders.length + 5}`;

    const newOrder: BuyerOrder = {
      orderId: newOrderId,
      loadNumber: newLoadNum,
      buyerName: 'Annapurna Kirana Network',
      crop: 'Hybrid Tomato',
      grade: 'Grade A',
      quantityKg: orderQuantityKg,
      priceRupeesKg: pricePerKg,
      totalEscrowRupees: totalCost,
      savingsRupees: buyerSavings,
      origin: 'Kolar Hub #01',
      destination: 'Annapurna DC, Whitefield',
      vehicle: 'Truck KA-04-E-8891 (Pre-cooled 11.5°C GPS Active)',
      eta: 'Today 18:00',
      status: 'ESCROW LOCKED • IN DISPATCH',
      depositStatus: 'Escrow 100% Cleared',
      progressPercent: 30,
      lots: [
        { id: 'lot_214', number: 214, farmer: 'Ramesh Chandra (Annur)', weightKg: Math.round(orderQuantityKg * 0.25), qrCode: 'FGH-ANNUR-2026-LOT214' },
        { id: 'lot_212', number: 212, farmer: 'Murugan K. (Kolar)', weightKg: Math.round(orderQuantityKg * 0.45), qrCode: 'FGH-KOLAR-2026-LOT212' },
        { id: 'lot_210', number: 210, farmer: 'Suresh Gowda (Hoskote)', weightKg: Math.round(orderQuantityKg * 0.30), qrCode: 'FGH-HOSKOTE-2026-LOT210' },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setOrderSuccess(true);

    // Persist to API
    fetch('/api/buyer/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: 'buyer_annapurna',
        crop: 'tomato',
        grade: 'A',
        quantityGrams: orderQuantityKg * 1000,
        offeredPricePaisePerKg: pricePerKg * 100,
        deliveryWindowHours: 24,
      }),
    }).catch(() => {});

    // Automatically transition to Active Dispatches & Escrow
    setTimeout(() => {
      setActiveTab('orders');
    }, 1500);
  };

  // Collect all unique lots across active orders for the Traceability tab
  const allTraceableLots = orders.flatMap((o) => o.lots);

  return (
    <div className="min-h-screen bg-bg text-ink pb-16">
      {/* Sub-header Banner */}
      <div className="bg-surface-elevated border-b border-border py-3 px-4 sm:px-6 shadow-sm sticky top-14 z-30">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <h1 className="font-serif font-bold text-base text-ink">Annapurna Kirana Network</h1>
              <Badge variant="success">VERIFIED WHOLESALE BUYER</Badge>
            </div>
            <span className="text-ink-muted hidden md:inline">| Buyer #BUY-01 • 45 Stores</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 px-3 bg-accent/10 border border-accent/20 rounded-lg text-accent font-semibold text-xs flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Sourcing Savings: 12.5% vs Mandi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border pb-px overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Graded Hub Supply</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Active Dispatches & Escrow ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('traceability')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'traceability'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <QrIcon className="w-4 h-4" />
            <span>Lot Traceability ({allTraceableLots.length} Lots)</span>
          </button>
        </div>

        {/* Tab 1: Graded Hub Supply Catalog */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Catalog Listing (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-ink">Ready Graded Collective Lots</h2>
                    <p className="text-xs text-ink-muted">Pre-cooled at 11.5°C in Kolar Solar Pods. Immediate dispatch.</p>
                  </div>
                  <Badge variant="simulated">LIVE INVENTORY</Badge>
                </div>

                {/* Listing Item 1: Grade A Tomatoes */}
                <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-ink">Hybrid Tomatoes (Firm Red / Pink)</h3>
                        <Badge variant="grade_a">Grade A</Badge>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Sourced from Kolar Cluster (3 Smallholders: Ramesh, Murugan, Suresh)
                      </p>
                    </div>
                    <span className="font-mono text-base font-bold text-accent">₹14.00 / kg</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-surface-elevated p-2.5 rounded-lg border border-border">
                    <div>
                      <span className="text-ink-muted block text-[10px]">AVAILABLE:</span>
                      <span className="font-bold text-ink">500 kg (25 crates)</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[10px]">TEMP CONTROL:</span>
                      <span className="font-bold text-accent">11.5°C Optimal</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[10px]">SHELF LIFE:</span>
                      <span className="font-bold text-ink">+5 Days vs Mandi</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-ink-muted">Traditional Mandi equivalent: ₹16.00/kg + 6% commission</span>
                    <span className="font-bold text-accent">Save ₹1,000+ on this load</span>
                  </div>
                </div>

                {/* Listing Item 2: Grade B Tomatoes */}
                <div className="bg-surface p-4 rounded-xl border border-border space-y-3 opacity-90">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-ink">Table Tomatoes (Turning Stage)</h3>
                        <Badge variant="grade_b">Grade B</Badge>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Ideal for institutional kitchens & catering networks
                      </p>
                    </div>
                    <span className="font-mono text-base font-bold text-ink">₹11.50 / kg</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-surface-elevated p-2.5 rounded-lg border border-border">
                    <div>
                      <span className="text-ink-muted block text-[10px]">AVAILABLE:</span>
                      <span className="font-bold text-ink">300 kg (15 crates)</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[10px]">TEMP CONTROL:</span>
                      <span className="font-bold text-accent">11.5°C Optimal</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[10px]">DISPATCH:</span>
                      <span className="font-bold text-ink">Tomorrow 09:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Order Form (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>Instant Escrow Contract</span>
                  </h3>
                  <Badge variant="success" size="sm">100% ESCROW PROTECTED</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-medium text-ink block mb-1">Contract Quantity (KG):</label>
                    <div className="flex items-center gap-2">
                      {[250, 500, 1000].map((qty) => (
                        <button
                          key={qty}
                          onClick={() => setOrderQuantityKg(qty)}
                          className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-xs border transition-all ${
                            orderQuantityKg === qty
                              ? 'bg-accent text-white border-accent ring-1 ring-accent'
                              : 'bg-surface border-border text-ink hover:border-border-strong'
                          }`}
                        >
                          {qty} kg
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface p-3.5 rounded-lg border border-border space-y-2 font-mono">
                    <div className="flex justify-between text-ink-muted">
                      <span>Rate:</span>
                      <span>₹{pricePerKg.toFixed(2)} / kg</span>
                    </div>
                    <div className="flex justify-between text-ink-muted">
                      <span>Mandi Benchmark:</span>
                      <span>₹{mandiBenchmarkKg.toFixed(2)} / kg</span>
                    </div>
                    <div className="flex justify-between font-bold text-accent pt-1 border-t border-border">
                      <span>Total Escrow Deposit:</span>
                      <span className="text-base">₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-700">
                      <span>Your Guaranteed Sourcing Savings:</span>
                      <span>₹{buyerSavings.toLocaleString('en-IN')} (12.5%)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Escrow is held by FarmGate Hub trust account and released only when produce arrives at your distribution center within the 24-hour SLA.
                  </p>

                  {orderSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Order Confirmed & Escrow Locked (₹{totalCost.toLocaleString('en-IN')})!</span>
                      </div>
                      <p className="font-mono text-[11px] text-emerald-700">
                        Consignment #{orders[0].loadNumber} is prepared for dispatch. Opening active tracking...
                      </p>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-accent underline flex items-center gap-1"
                      >
                        <span>View in Active Dispatches & Escrow →</span>
                      </button>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={handlePlaceOrder}
                    className="w-full min-h-[48px] font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Confirm Order & Escrow (₹{totalCost.toLocaleString('en-IN')})</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Active Dispatches & Escrow */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-accent animate-pulse" />
                    <h2 className="text-base font-bold text-ink">
                      Active Collective Load: #{order.loadNumber} ({order.quantityKg} kg)
                    </h2>
                    <span className="text-xs font-mono text-accent">({order.orderId})</span>
                  </div>
                  <Badge variant="success">{order.status}</Badge>
                </div>

                {/* Transit Timeline */}
                <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-ink-muted block text-[11px]">Vehicle:</span>
                      <span className="font-mono font-bold text-ink">{order.vehicle}</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Origin:</span>
                      <span className="font-bold text-ink">{order.origin}</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Destination:</span>
                      <span className="font-bold text-ink">{order.destination}</span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">ETA:</span>
                      <span className="font-mono font-bold text-accent">{order.eta}</span>
                    </div>
                  </div>

                  <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full transition-all" style={{ width: `${order.progressPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-ink-muted">
                    <span>Hub Departure</span>
                    <span>Cold-Chain Transit (11.5°C)</span>
                    <span>DC Inbound SLA</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-3 bg-surface rounded-lg border border-border flex flex-wrap items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-ink-muted">Escrow Locked:</span>{' '}
                    <strong className="text-accent">₹{order.totalEscrowRupees.toLocaleString('en-IN')}</strong>{' '}
                    ({order.quantityKg} kg @ ₹{order.priceRupeesKg}/kg)
                  </div>
                  <div className="text-emerald-700">
                    <span className="text-ink-muted">Guaranteed Savings:</span>{' '}
                    <strong>₹{order.savingsRupees.toLocaleString('en-IN')} vs Mandi</strong>
                  </div>
                </div>

                {/* Traceability Link to Lots */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                    Aggregated Micro-Lots Inside Consignment #{order.loadNumber}:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {order.lots.map((lot) => (
                      <div key={lot.id} className="p-3 bg-surface rounded-lg border border-border flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-xs">
                            <span className="font-mono font-bold text-accent">Lot #{lot.number}</span>
                            <span className="font-mono font-bold text-ink">{lot.weightKg} kg</span>
                          </div>
                          <p className="text-[11px] text-ink-muted mt-1">Farmer: {lot.farmer}</p>
                        </div>
                        <Link
                          to={`/t/${lot.qrCode}`}
                          className="text-accent text-[11px] font-semibold underline mt-2.5 flex items-center gap-1 hover:opacity-80"
                        >
                          <span>Inspect Traceability →</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Lot Traceability Explorer */}
        {activeTab === 'traceability' && (
          <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-ink">Public QR Traceability Explorer ({allTraceableLots.length} Lots Available)</h2>
            <p className="text-xs text-ink-muted">
              Every crate sold to Annapurna contains an indelible QR code allowing consumers and store managers to verify harvest origin, grading, and farmer payout fairness.
            </p>

            <div className="space-y-3">
              {allTraceableLots.map((lot) => (
                <div key={lot.id} className="p-4 bg-surface rounded-xl border border-border flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-sm text-ink">QR Code: {lot.qrCode}</span>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Lot #{lot.number}: {lot.weightKg} kg Grade A Hybrid Tomatoes ({lot.farmer})
                    </p>
                  </div>

                  <Link
                    to={`/t/${lot.qrCode}`}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1.5 transition-all"
                  >
                    <span>View Public Traceability Certificate →</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
