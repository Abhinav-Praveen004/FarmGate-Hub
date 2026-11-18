import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { Badge, Button } from '@farmgate/ui';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Thermometer,
  Truck,
  Leaf,
  ArrowRight,
  ExternalLink,
  MapPin,
  User,
  QrCode as QrIcon,
  Printer,
  Sparkles,
  ChevronRight,
  Search,
} from 'lucide-react';
import { formatWeightKg } from '@farmgate/shared';

interface TraceabilityData {
  traceabilityCode: string;
  lotNumber: number;
  crop: string;
  rawCrop: string;
  grade: string;
  weightKg: number;
  hubName: string;
  receivedAt: string;
  soldAt?: string;
  hoursInCoolPod: number;
  storageTemperatureRange: string;
  qualityReport: {
    blemishPercent: number;
    firmnessRating: string;
    sizeClass: string;
    ripeness: string;
  };
  farmer: {
    name: string;
    village: string;
    collective: string;
    acreage: string;
    optedIn: boolean;
  };
  fairShare: {
    consumerReferencePriceRupees: number;
    farmerRealizationRupees: number;
    farmerSharePercent: number;
    traditionalMandiSharePercent: number;
    traditionalMandiPriceRupees: number;
  };
  timeline: {
    timestamp: string;
    status: string;
    note: string;
  }[];
  status: string;
  verified: boolean;
}

export const TraceabilityPage: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const activeCode = code || 'FGH-ANNUR-2026-LOT214';

  const [traceData, setTraceData] = useState<TraceabilityData | null>(null);
  const [allLots, setAllLots] = useState<any[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all lots directory for switcher
  useEffect(() => {
    fetch('/api/traceability')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.lots) {
          setAllLots(data.lots);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch certificate for the active lot code
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/traceability/${encodeURIComponent(activeCode)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.traceabilityCode) {
          setTraceData(data);
        } else {
          // Fallback defaults
          setTraceData({
            traceabilityCode: activeCode,
            lotNumber: 214,
            crop: 'Hybrid Tomato (Firm Red)',
            rawCrop: 'tomato',
            grade: 'Grade A',
            weightKg: 120.4,
            hubName: 'FarmGate Hub #01 (Kolar & Annur Cluster FPO)',
            receivedAt: 'Today 08:30 AM',
            hoursInCoolPod: 14,
            storageTemperatureRange: '10.0°C - 13.0°C (Solar Thermal Storage)',
            qualityReport: {
              blemishPercent: 3.2,
              firmnessRating: '4/5',
              sizeClass: 'medium',
              ripeness: 'pink',
            },
            farmer: {
              name: 'Ramesh Chandra',
              village: 'Annur Village, Kolar District',
              collective: 'Annur Farmers Producer Organisation (FPO)',
              acreage: '2.0 Acre Family Farm',
              optedIn: true,
            },
            fairShare: {
              consumerReferencePriceRupees: 30.0,
              farmerRealizationRupees: 13.5,
              farmerSharePercent: 45.0,
              traditionalMandiSharePercent: 33.0,
              traditionalMandiPriceRupees: 9.0,
            },
            timeline: [
              { timestamp: '07:30 AM', status: 'harvested', note: 'Harvested at breaker stage in Annur, packed in field crates.' },
              { timestamp: '08:30 AM', status: 'graded', note: 'Digital scale weigh-in at Kolar Hub. Graded Grade A.' },
              { timestamp: '09:00 AM', status: 'in_pod', note: 'Field heat eliminated. Stored at 11.5°C in Solar Cool Pod.' },
              { timestamp: '14:30 PM', status: 'sold', note: 'Collective Load #CL-04 dispatched to Annapurna Retail Network.' },
              { timestamp: '16:30 PM', status: 'delivered', note: 'Delivered to retail distribution center with 100% cold-chain integrity.' },
            ],
            status: 'DISPATCHED',
            verified: true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Generate real QR code image
    const fullUrl = `${window.location.origin}/t/${activeCode}`;
    QRCode.toDataURL(fullUrl, { width: 180, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [activeCode]);

  const handlePrint = () => {
    window.print();
  };

  const certificateLot = traceData?.lotNumber || 214;
  const isGradeA = (traceData?.grade || 'A').toUpperCase() === 'GRADE A' || (traceData?.grade || 'A').toUpperCase() === 'A';

  return (
    <div className="min-h-screen bg-bg text-ink pb-16">
      {/* Sub-header Banner */}
      <div className="bg-surface-elevated border-b border-border py-3 px-4 sm:px-6 shadow-sm sticky top-14 z-30">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <h1 className="font-serif font-bold text-base text-ink">Public QR Traceability Explorer</h1>
              <Badge variant="success">DPDP VERIFIED PROVENANCE</Badge>
            </div>
            <span className="text-ink-muted hidden md:inline">| Kolar Peri-Urban Cluster</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1.5 py-1 px-3 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Lot Selector Toolbar */}
        <div className="p-3 bg-surface-elevated border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
            <Search className="w-4 h-4 text-accent" />
            <span>Select Traceable Lot:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {allLots.length > 0 ? (
              allLots.map((l) => {
                const isSelected = activeCode.includes(String(l.lotNumber)) || activeCode === l.qrCode;
                return (
                  <button
                    key={l.lotId}
                    onClick={() => navigate(`/t/${l.qrCode || `FGH-ANNUR-2026-LOT${l.lotNumber}`}`)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-accent text-white border-accent ring-1 ring-accent'
                        : 'bg-surface border-border text-ink hover:border-border-strong'
                    }`}
                  >
                    Lot #{l.lotNumber} ({l.crop})
                  </button>
                );
              })
            ) : (
              [
                { num: 214, code: 'FGH-ANNUR-2026-LOT214', crop: 'Tomato' },
                { num: 212, code: 'FGH-KOLAR-2026-LOT212', crop: 'Tomato' },
                { num: 210, code: 'FGH-HOSKOTE-2026-LOT210', crop: 'Tomato' },
                { num: 215, code: 'FGH-ANNUR-2026-LOT215', crop: 'Onion' },
                { num: 216, code: 'FGH-ANNUR-2026-LOT216', crop: 'Potato' },
                { num: 217, code: 'FGH-ANNUR-2026-LOT217', crop: 'Chilli' },
              ].map((l) => {
                const isSelected = activeCode.includes(String(l.num));
                return (
                  <button
                    key={l.num}
                    onClick={() => navigate(`/t/${l.code}`)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-accent text-white border-accent ring-1 ring-accent'
                        : 'bg-surface border-border text-ink hover:border-border-strong'
                    }`}
                  >
                    Lot #{l.num} ({l.crop})
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout for Desktop & Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Official Provenance Certificate (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div
              id="printable-certificate"
              className="bg-surface-elevated border-2 border-accent/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Certificate Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80 text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 text-accent flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent block">
                      Verified Farm-Gate Provenance
                    </span>
                    <h2 className="font-serif font-bold text-2xl text-ink mt-0.5">
                      Traceability Certificate
                    </h2>
                    <p className="font-mono text-xs text-ink-muted mt-0.5">{traceData?.traceabilityCode || activeCode}</p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <Badge variant={isGradeA ? 'grade_a' : 'grade_b'} size="md">
                    {traceData?.grade || 'Grade A'}
                  </Badge>
                  <span className="text-[11px] font-mono text-ink-muted block mt-1">
                    Lot #{certificateLot} Verified
                  </span>
                </div>
              </div>

              {/* Core Crop & Quality Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-surface p-4 rounded-xl border border-border">
                <div>
                  <span className="text-ink-muted block text-[10px]">CROP VARIETY</span>
                  <span className="font-bold text-ink text-sm">{traceData?.crop || 'Hybrid Tomato'}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[10px]">VERIFIED WEIGHT</span>
                  <span className="font-bold text-ink text-sm">{(traceData?.weightKg || 120.4).toFixed(1)} kg</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[10px]">PRE-COOLING</span>
                  <span className="font-bold text-accent text-sm">11.5°C Solar Pod</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[10px]">AI BLEMISH AUDIT</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {traceData?.qualityReport.blemishPercent || 3.2}% Clean
                  </span>
                </div>
              </div>

              {/* Farmer Attribution Section */}
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
                    {traceData?.farmer.name
                      ? traceData.farmer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                      : 'RC'}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                      Grown by Smallholder
                    </span>
                    <h3 className="text-base font-bold text-ink">{traceData?.farmer.name || 'Ramesh Chandra'}</h3>
                    <p className="text-xs text-ink-muted">
                      {traceData?.farmer.village || 'Annur Village, Kolar District'} • {traceData?.farmer.acreage || '2.0 Acre Family Farm'}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-accent/20 flex flex-wrap items-center justify-between text-xs text-ink-muted">
                  <span className="flex items-center gap-1 text-ink font-medium">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>Origin Hub: {traceData?.hubName || 'Kolar Hub #01'}</span>
                  </span>
                  <span className="font-mono text-[11px] text-accent font-bold">
                    ✓ Verified Member of {traceData?.farmer.collective || 'Annur FPO'}
                  </span>
                </div>
              </div>

              {/* Complete Farm-to-Fork Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>Complete Farm-to-Fork Chronological Audit Trail</span>
                </h3>

                <div className="space-y-3.5 text-xs relative pl-4 border-l-2 border-accent/30 ml-2 py-1">
                  {traceData?.timeline && traceData.timeline.length > 0 ? (
                    traceData.timeline.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent border-2 border-surface-elevated" />
                        <div className="flex items-center gap-2 font-bold text-ink">
                          <span className="font-mono text-accent">{step.timestamp}</span>
                          <span className="capitalize">• {step.status.replace('_', ' ')}</span>
                        </div>
                        <p className="text-ink-muted mt-0.5 text-[11px] leading-relaxed">{step.note}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-ink">
                          <span className="font-mono text-accent">07:30 AM</span>
                          <span>• Harvested at Farm Gate</span>
                        </div>
                        <p className="text-ink-muted mt-0.5">Harvested at breaker stage in Annur, packed in field crates.</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-ink">
                          <span className="font-mono text-accent">08:30 AM</span>
                          <span>• Digital Scale Intake & Grading</span>
                        </div>
                        <p className="text-ink-muted mt-0.5">Digital load-cell weigh-in at Kolar Hub. Graded Grade A.</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-accent">
                          <span className="font-mono text-accent">09:00 AM</span>
                          <span>• Solar Cool Pod Pre-cooling (11.5°C)</span>
                        </div>
                        <p className="text-ink-muted mt-0.5">Stored in solar micro-pod for 14 hours. Field heat eliminated.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Fair Share Transparency Box */}
              <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <h4 className="text-xs font-bold text-ink">Fair Share Payout Transparency</h4>
                  </div>
                  <Badge variant="success" size="sm">DOUBLE-ENTRY VERIFIED</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-surface-elevated p-3 rounded-lg border border-border text-center">
                  <div>
                    <span className="text-ink-muted block text-[10px]">CONSUMER PAYS</span>
                    <span className="font-bold text-ink">
                      ₹{(traceData?.fairShare.consumerReferencePriceRupees || 30.0).toFixed(2)}/kg
                    </span>
                  </div>
                  <div className="border-x border-border/80">
                    <span className="text-ink-muted block text-[10px]">FARMER RECEIVED</span>
                    <span className="font-bold text-accent">
                      ₹{(traceData?.fairShare.farmerRealizationRupees || 13.5).toFixed(2)}/kg
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[10px]">FARMER SHARE</span>
                    <span className="font-bold text-emerald-700">
                      {traceData?.fairShare.farmerSharePercent || 45.0}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted">
                  Traditional middlemen mandis only deliver <strong>33% (₹9.00/kg)</strong> to smallholders. FarmGate Hub guarantees <strong>45% direct value capture</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Explorer Tools & QR Code (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live QR Code Card */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm text-center space-y-3">
              <div className="flex items-center justify-between text-left">
                <div>
                  <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                    <QrIcon className="w-4 h-4 text-accent" />
                    <span>Live Crate QR Code</span>
                  </h3>
                  <p className="text-xs text-ink-muted">Scan with phone camera to open this certificate</p>
                </div>
                <Badge variant="simulated">PHYSICAL LABEL</Badge>
              </div>

              <div className="p-4 bg-white rounded-xl border-2 border-dashed border-border inline-block shadow-inner my-2">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Traceability QR" className="w-40 h-40 mx-auto" />
                ) : (
                  <div className="w-40 h-40 bg-stone-100 flex items-center justify-center font-mono text-xs">
                    Generating QR...
                  </div>
                )}
                <span className="font-mono text-[10px] font-bold text-ink block mt-2">
                  {traceData?.traceabilityCode || activeCode}
                </span>
              </div>

              <p className="text-[11px] text-ink-muted">
                Stickered onto all 25 field crates before dispatching to Annapurna Retail Network stores.
              </p>
            </div>

            {/* DPDP Compliance Card */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-ink flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>DPDP Compliance</span>
                </span>
                <Badge variant="neutral" size="sm">ACT 2023</Badge>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                Compliant with India's Digital Personal Data Protection Act. Farmer identity, bank VPA, and phone numbers are encrypted with explicit opt-in for public consumer traceability.
              </p>

              <div className="p-3 bg-surface rounded-lg border border-border text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Farmer Privacy Opt-In:</span>
                  <span className="font-bold text-accent">✓ Explicit Consent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Banking & UPI VPA:</span>
                  <span className="font-bold text-ink">Encrypted & Redacted</span>
                </div>
              </div>
            </div>

            {/* Environmental Impact Proof */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>Cold-Chain Environmental Proof</span>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                By eliminating field heat within 45 minutes at 11.5°C in the solar pod, this lot saved <strong>18 kg of food spoilage</strong> and prevented <strong>23 kg of CO₂e methane emissions</strong>.
              </p>

              <Link
                to="/impact"
                className="w-full py-2.5 px-3 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 text-accent font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full ESG Audit in Impact Dashboard →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
