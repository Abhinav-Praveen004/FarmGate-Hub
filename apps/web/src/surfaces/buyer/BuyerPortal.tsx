import React, { useState, useEffect } from 'react';
import { Badge, Button } from '@farmgate/ui';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  ShieldCheck,
  QrCode as QrIcon,
  TrendingDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFarmerLots } from '../../api/client';

export function getCropConfig(cropName?: string) {
  const c = (cropName || 'tomato').toLowerCase();
  if (c.includes('chilli')) {
    return {
      name: 'Green Chilli (G4)',
      shortName: 'Chilli',
      icon: '🌶️',
      gradeAPrice: 42.0,
      gradeBPrice: 34.0,
      mandiRef: 48.0,
      shelfLife: '+6 Days vs Mandi',
    };
  }
  if (c.includes('potato')) {
    return {
      name: 'Potato (Kufri Jyoti)',
      shortName: 'Potato',
      icon: '🥔',
      gradeAPrice: 18.0,
      gradeBPrice: 14.5,
      mandiRef: 20.0,
      shelfLife: '+14 Days vs Mandi',
    };
  }
  if (c.includes('onion')) {
    return {
      name: 'Red Onion (Nashik)',
      shortName: 'Onion',
      icon: '🧅',
      gradeAPrice: 24.0,
      gradeBPrice: 19.0,
      mandiRef: 28.0,
      shelfLife: '+10 Days vs Mandi',
    };
  }
  return {
    name: 'Hybrid Tomatoes (Firm Red)',
    shortName: 'Tomato',
    icon: '🍅',
    gradeAPrice: 14.0,
    gradeBPrice: 11.5,
    mandiRef: 16.0,
    shelfLife: '+5 Days vs Mandi',
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

interface BuyerLot {
  id: string;
  number: number;
  farmer: string;
  crop: string;
  grade: string;
  weightKg: number;
  qrCode: string;
}

interface BuyerOrder {
  orderId: string;
  loadNumber: string;
  buyerName: string;
  crop: string;
  icon: string;
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

interface CatalogSupplyItem {
  key: string;
  crop: string;
  grade: string;
  title: string;
  icon: string;
  farmers: string[];
  totalAvailableKg: number;
  cratesCount: number;
  pricePerKg: number;
  mandiBenchmark: number;
  shelfLife: string;
  lots: Array<{ id: string; number: number; farmer: string; weightKg: number; qrCode: string }>;
}

export const BuyerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'traceability'>('catalog');
  const [orderQuantityKg, setOrderQuantityKg] = useState<number>(120);
  const [selectedSupplyKey, setSelectedSupplyKey] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  const { data: rawLots } = useFarmerLots();

  // Dynamic grouping of live lots currently stored in the Cool Pod
  const supplyItems: CatalogSupplyItem[] = React.useMemo(() => {
    const activeLots = (rawLots && rawLots.length > 0 ? rawLots : []).filter((l) => {
      const s = (l.status || '').toUpperCase();
      return s === 'IN_POD' || s === 'GRADED' || s === 'SOLD';
    });

    if (activeLots.length === 0) {
      // Fallback supply items if database is totally empty
      return [
        {
          key: 'potato_A',
          crop: 'Potato',
          grade: 'A',
          title: 'Potato (Kufri Jyoti) 🥔',
          icon: '🥔',
          farmers: ['Murugan K.'],
          totalAvailableKg: 120,
          cratesCount: 6,
          pricePerKg: 18.0,
          mandiBenchmark: 20.0,
          shelfLife: '+14 Days vs Mandi',
          lots: [{ id: 'lot_215', number: 215, farmer: 'Murugan K.', weightKg: 120, qrCode: 'FGH-ANNUR-2026-LOT215' }],
        },
        {
          key: 'chilli_A',
          crop: 'Chilli',
          grade: 'A',
          title: 'Green Chilli (G4) 🌶️',
          icon: '🌶️',
          farmers: ['Lakshmi Devi'],
          totalAvailableKg: 120,
          cratesCount: 6,
          pricePerKg: 42.0,
          mandiBenchmark: 48.0,
          shelfLife: '+6 Days vs Mandi',
          lots: [{ id: 'lot_214', number: 214, farmer: 'Lakshmi Devi', weightKg: 120, qrCode: 'FGH-ANNUR-2026-LOT214' }],
        },
        {
          key: 'tomato_A',
          crop: 'Tomato',
          grade: 'A',
          title: 'Hybrid Tomatoes (Firm Red) 🍅',
          icon: '🍅',
          farmers: ['Ramesh Chandra', 'Suresh Gowda'],
          totalAvailableKg: 380,
          cratesCount: 19,
          pricePerKg: 14.0,
          mandiBenchmark: 16.0,
          shelfLife: '+5 Days vs Mandi',
          lots: [
            { id: 'lot_212', number: 212, farmer: 'Ramesh Chandra', weightKg: 240, qrCode: 'FGH-KOLAR-2026-LOT212' },
            { id: 'lot_210', number: 210, farmer: 'Suresh Gowda', weightKg: 140, qrCode: 'FGH-HOSKOTE-2026-LOT210' },
          ],
        },
      ];
    }

    // Group active lots by normalized crop & grade
    const map = new Map<string, CatalogSupplyItem>();

    for (const lot of activeLots) {
      const cfg = getCropConfig(lot.crop);
      const grade = (lot.grade || 'A').toUpperCase();
      const key = `${cfg.shortName.toLowerCase()}_${grade}`;
      const farmerName = FARMER_NAMES[lot.farmerId] || lot.farmerName || lot.farmerId;
      const weightKg = Math.round((lot.weightGrams || 120000) / 1000);
      const qrCode = lot.qrCode || `FGH-ANNUR-2026-LOT${lot.lotNumber}`;

      if (!map.has(key)) {
        const unitPrice = grade === 'A' ? cfg.gradeAPrice : cfg.gradeBPrice;
        const mandiRef = grade === 'A' ? cfg.mandiRef : Math.round(cfg.mandiRef * 0.85);

        map.set(key, {
          key,
          crop: cfg.shortName,
          grade,
          title: `${cfg.name} ${cfg.icon}`,
          icon: cfg.icon,
          farmers: [farmerName],
          totalAvailableKg: weightKg,
          cratesCount: Math.ceil(weightKg / 20),
          pricePerKg: unitPrice,
          mandiBenchmark: mandiRef,
          shelfLife: cfg.shelfLife,
          lots: [{ id: String(lot.id), number: lot.lotNumber, farmer: farmerName, weightKg, qrCode }],
        });
      } else {
        const item = map.get(key)!;
        item.totalAvailableKg += weightKg;
        item.cratesCount = Math.ceil(item.totalAvailableKg / 20);
        if (!item.farmers.includes(farmerName)) item.farmers.push(farmerName);
        item.lots.push({ id: String(lot.id), number: lot.lotNumber, farmer: farmerName, weightKg, qrCode });
      }
    }

    return Array.from(map.values());
  }, [rawLots]);

  // Set default selected item
  useEffect(() => {
    if (supplyItems.length > 0 && !selectedSupplyKey) {
      setSelectedSupplyKey(supplyItems[0].key);
      setOrderQuantityKg(supplyItems[0].totalAvailableKg || 120);
    }
  }, [supplyItems, selectedSupplyKey]);

  const activeSupplyItem = supplyItems.find((s) => s.key === selectedSupplyKey) || supplyItems[0] || {
    key: 'default',
    crop: 'Tomato',
    grade: 'A',
    title: 'Hybrid Tomatoes 🍅',
    icon: '🍅',
    farmers: ['Ramesh Chandra'],
    totalAvailableKg: 120,
    cratesCount: 6,
    pricePerKg: 14.0,
    mandiBenchmark: 16.0,
    shelfLife: '+5 Days vs Mandi',
    lots: [],
  };

  const [orders, setOrders] = useState<BuyerOrder[]>(() => [
    {
      orderId: 'ORD-771',
      loadNumber: 'CL-04',
      buyerName: 'Annapurna Kirana Network',
      crop: 'Green Chilli (G4)',
      icon: '🌶️',
      grade: 'Grade A',
      quantityKg: 120,
      priceRupeesKg: 42.0,
      totalEscrowRupees: 5040,
      savingsRupees: 720,
      origin: 'Kolar Hub #01',
      destination: 'Annapurna DC, Whitefield',
      vehicle: 'Truck KA-04-E-8891 (Pre-cooled 11.5°C GPS Active)',
      eta: 'Today 16:30',
      status: 'IN TRANSIT • ESCROW LOCKED',
      depositStatus: 'Escrow 100% Cleared',
      progressPercent: 75,
      lots: [
        {
          id: 'lot_214',
          number: 214,
          farmer: 'Lakshmi Devi (Annur)',
          crop: 'Chilli',
          grade: 'A',
          weightKg: 120,
          qrCode: 'FGH-ANNUR-2026-LOT214',
        },
      ],
    },
  ]);

  const pricePerKg = activeSupplyItem.pricePerKg;
  const mandiBenchmarkKg = activeSupplyItem.mandiBenchmark;
  const totalCost = orderQuantityKg * pricePerKg;
  const mandiCost = orderQuantityKg * mandiBenchmarkKg;
  const buyerSavings = Math.max(0, mandiCost - totalCost);

  const handlePlaceOrder = () => {
    const newOrderId = `ORD-${Math.floor(773 + Math.random() * 50)}`;
    const newLoadNum = `CL-0${orders.length + 5}`;

    const newOrder: BuyerOrder = {
      orderId: newOrderId,
      loadNumber: newLoadNum,
      buyerName: 'Annapurna Kirana Network',
      crop: activeSupplyItem.crop,
      icon: activeSupplyItem.icon,
      grade: `Grade ${activeSupplyItem.grade}`,
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
      lots: activeSupplyItem.lots.map((l) => ({
        ...l,
        crop: activeSupplyItem.crop,
        grade: activeSupplyItem.grade,
      })),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setOrderSuccess(true);

    // Persist to API
    fetch('/api/buyer/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: 'buyer_annapurna',
        crop: activeSupplyItem.crop.toLowerCase(),
        grade: activeSupplyItem.grade,
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
              <span>Sourcing Savings: ~12.5% vs Mandi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border pb-px overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-4 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Graded Hub Supply ({supplyItems.length} Produce Available)</span>
          </button>

          <button
            type="button"
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
            type="button"
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
                    <p className="text-xs text-ink-muted">
                      Live inventory pre-cooled at 11.5°C in Kolar Solar Cool Pod. Immediate wholesale dispatch.
                    </p>
                  </div>
                  <Badge variant="simulated">POD SENSOR FEED</Badge>
                </div>

                {/* Dynamic Listing of Lots in the Cool Pod */}
                <div className="space-y-3">
                  {supplyItems.map((item) => {
                    const isSelected = item.key === selectedSupplyKey;
                    return (
                      <div
                        key={item.key}
                        onClick={() => {
                          setSelectedSupplyKey(item.key);
                          setOrderQuantityKg(item.totalAvailableKg);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                          isSelected
                            ? 'border-accent bg-accent/5 ring-1 ring-accent shadow-xs'
                            : 'bg-surface border-border hover:border-border-strong'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-ink">{item.title}</h3>
                              <Badge variant={item.grade === 'A' ? 'grade_a' : 'grade_b'}>
                                Grade {item.grade}
                              </Badge>
                            </div>
                            <p className="text-xs text-ink-muted mt-0.5">
                              Sourced from Kolar Cluster ({item.farmers.slice(0, 3).join(', ')}
                              {item.farmers.length > 3 ? ` +${item.farmers.length - 3}` : ''})
                            </p>
                          </div>
                          <span className="font-mono text-base font-bold text-accent">
                            ₹{item.pricePerKg.toFixed(2)} / kg
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-surface-elevated p-2.5 rounded-lg border border-border">
                          <div>
                            <span className="text-ink-muted block text-[10px]">AVAILABLE IN POD:</span>
                            <span className="font-bold text-ink">
                              {item.totalAvailableKg} kg ({item.cratesCount} crates)
                            </span>
                          </div>
                          <div>
                            <span className="text-ink-muted block text-[10px]">TEMP CONTROL:</span>
                            <span className="font-bold text-accent">11.5°C Optimal</span>
                          </div>
                          <div>
                            <span className="text-ink-muted block text-[10px]">SHELF LIFE:</span>
                            <span className="font-bold text-ink">{item.shelfLife}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="text-ink-muted">
                            Mandi benchmark: ₹{item.mandiBenchmark.toFixed(2)}/kg + commission
                          </span>
                          <span className="font-bold text-accent">
                            Click to select for Escrow Contract →
                          </span>
                        </div>
                      </div>
                    );
                  })}
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
                  {/* Selected Crop Overview */}
                  <div className="p-3 bg-surface rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-ink-muted block uppercase">Selected Produce</span>
                      <span className="font-bold text-sm text-ink">{activeSupplyItem.title}</span>
                    </div>
                    <Badge variant={activeSupplyItem.grade === 'A' ? 'grade_a' : 'grade_b'}>
                      Grade {activeSupplyItem.grade}
                    </Badge>
                  </div>

                  <div>
                    <label className="font-medium text-ink block mb-1">Contract Quantity (KG):</label>
                    <div className="flex items-center gap-2">
                      {[
                        Math.min(activeSupplyItem.totalAvailableKg, 120),
                        Math.min(activeSupplyItem.totalAvailableKg, 250),
                        activeSupplyItem.totalAvailableKg,
                      ]
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((qty) => (
                          <button
                            key={qty}
                            type="button"
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
                      <span>Rate ({activeSupplyItem.crop}):</span>
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
                      <span>₹{buyerSavings.toLocaleString('en-IN')} vs Mandi</span>
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
                        type="button"
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
                      Active Collective Load: #{order.loadNumber} ({order.quantityKg} kg {order.crop} {order.icon})
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
                    ({order.quantityKg} kg {order.crop} @ ₹{order.priceRupeesKg}/kg)
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
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent">
                            {lot.crop} (Grade {lot.grade})
                          </span>
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
            <h2 className="text-base font-bold text-ink">
              Public QR Traceability Explorer ({allTraceableLots.length} Lots Available)
            </h2>
            <p className="text-xs text-ink-muted">
              Every crate sold through FarmGate Hub contains an indelible QR code allowing consumers and store managers to verify harvest origin, cool pod holding hours, grading, and farmer payout fairness.
            </p>

            <div className="space-y-3">
              {allTraceableLots.map((lot) => (
                <div key={lot.id} className="p-4 bg-surface rounded-xl border border-border flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-sm text-ink">QR Code: {lot.qrCode}</span>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Lot #{lot.number}: {lot.weightKg} kg Grade {lot.grade} {lot.crop} ({lot.farmer})
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
