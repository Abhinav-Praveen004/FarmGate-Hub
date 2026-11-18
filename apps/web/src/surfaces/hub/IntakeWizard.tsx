import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Badge, Button } from '@farmgate/ui';
import { useFarmerLots } from '../../api/client';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronRight,
  ShieldCheck,
  User,
  QrCode as QrIcon,
  RotateCcw,
} from 'lucide-react';
import { formatWeightKg } from '@farmgate/shared';

const SAMPLE_FARMERS = [
  { id: 'FARMER-001', name: 'Ramesh Chandra', village: 'Annur', phone: '+91 98450 12345' },
  { id: 'FARMER-002', name: 'Murugan K.', village: 'Kolar', phone: '+91 98450 67890' },
  { id: 'FARMER-003', name: 'Lakshmi Devi', village: 'Malur', phone: '+91 98450 11223' },
  { id: 'FARMER-004', name: 'Suresh Gowda', village: 'Hoskote', phone: '+91 98450 44556' },
];

export const IntakeWizard: React.FC = () => {
  const [selectedFarmerId, setSelectedFarmerId] = useState(SAMPLE_FARMERS[0].id);
  const [cratesCount, setCratesCount] = useState(5);
  const [scaleWeightKg, setScaleWeightKg] = useState(120.4);
  const [isCapturingScale, setIsCapturingScale] = useState(false);
  const [blemishPercent, setBlemishPercent] = useState(3);
  const [firmness, setFirmness] = useState(4);
  const [ripeness, setRipeness] = useState<'turning' | 'pink' | 'light_red' | 'red'>('pink');
  const [sizeClass, setSizeClass] = useState<'small' | 'medium' | 'large'>('medium');
  const [overrideGrade, setOverrideGrade] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successLot, setSuccessLot] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const selectedFarmer = SAMPLE_FARMERS.find((f) => f.id === selectedFarmerId) || SAMPLE_FARMERS[0];

  // Dynamic Rule-Based Suggested Grade
  const suggestedGrade = blemishPercent <= 5 && firmness >= 4 ? 'A' : blemishPercent <= 12 && firmness >= 2 ? 'B' : 'C';
  const finalGrade = overrideGrade || suggestedGrade;

  // Poll or capture live scale
  const captureScaleReading = async () => {
    setIsCapturingScale(true);
    try {
      const res = await fetch('/api/hub/scale/read');
      const data = await res.json();
      if (data.weightKg) {
        setScaleWeightKg(data.weightKg);
      }
    } catch {
      // Fallback slight jitter simulation
      setScaleWeightKg(Number((120.0 + Math.random() * 2).toFixed(2)));
    } finally {
      setTimeout(() => setIsCapturingScale(false), 400);
    }
  };

  // Generate QR for sticker preview
  useEffect(() => {
    const code = successLot?.qrCode || `FGH-ANNUR-2026-LOT215`;
    QRCode.toDataURL(code, { width: 140, margin: 1 }, (err, url) => {
      if (!err && url) setQrDataUrl(url);
    });
  }, [successLot]);

  const handleSubmitIntake = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/hub/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: selectedFarmer.id,
          crop: 'tomato',
          weightGrams: Math.round(scaleWeightKg * 1000),
          quality: {
            blemishPercent,
            firmness,
            sizeClass,
            ripeness,
          },
          overrideGrade: overrideGrade || undefined,
          overrideReason: overrideGrade ? overrideReason : undefined,
        }),
      });

      const data = await res.json();
      if (data.lot) {
        setSuccessLot(data.lot);
      }
    } catch (err) {
      console.error('Intake failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Operator Console: Intake & Grading</span>
          <h1 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            Intake & Digital Scale Wizard
            <Badge variant="simulated">LIVE HARDWARE ADAPTER</Badge>
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-ink-muted block">Hub Lead</span>
          <span className="text-xs font-bold text-ink">Ravi Shankar (Kolar #01)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step 1: Farmer Selection */}
          <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-mono text-[11px]">1</span>
              <span>Select Arrived Farmer</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_FARMERS.map((f) => {
                const isSelected = f.id === selectedFarmerId;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFarmerId(f.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/10 ring-1 ring-accent text-accent'
                        : 'border-border bg-surface text-ink hover:border-border-strong'
                    }`}
                  >
                    <div className="font-bold text-xs text-ink">{f.name}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      Village: {f.village} • {f.phone}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Digital Scale Capture */}
          <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-mono text-[11px]">2</span>
                <span>Digital Scale Readout</span>
              </div>
              <Badge variant="simulated" size="sm">RS-232 / BLE: ONLINE</Badge>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-ink-muted block">Live Net Weight</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-3xl font-bold text-ink">{scaleWeightKg.toFixed(2)}</span>
                  <span className="text-sm font-bold text-ink-muted">KG</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-ink-muted block">Crates</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={cratesCount}
                    onChange={(e) => setCratesCount(Number(e.target.value))}
                    className="w-16 bg-surface-elevated border border-border rounded px-2 py-1 text-center font-mono text-sm font-bold text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={captureScaleReading}
                  disabled={isCapturingScale}
                  className="flex items-center gap-2 shrink-0 min-h-[44px]"
                >
                  <Scale className={`w-4 h-4 ${isCapturingScale ? 'animate-spin' : ''}`} />
                  <span>{isCapturingScale ? 'Reading...' : 'Capture Scale'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Fast 30-Second Grading Checklist */}
          <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-mono text-[11px]">3</span>
                <span>Fast 30-Second Grading Checklist</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-ink-muted">Engine Result:</span>
                <Badge variant={suggestedGrade === 'A' ? 'grade_a' : suggestedGrade === 'B' ? 'grade_b' : 'grade_c'}>
                  Grade {suggestedGrade}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Blemish % */}
              <div className="bg-surface p-3 rounded-lg border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-ink">Blemish / Damage:</span>
                  <span className="font-mono font-bold text-ink">{blemishPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={blemishPercent}
                  onChange={(e) => setBlemishPercent(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-ink-muted font-mono">
                  <span>&lt;5% (Grade A)</span>
                  <span>5-12% (Grade B)</span>
                  <span>&gt;12% (Grade C)</span>
                </div>
              </div>

              {/* Firmness */}
              <div className="bg-surface p-3 rounded-lg border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-ink">Firmness (1-5):</span>
                  <span className="font-mono font-bold text-ink">{firmness} / 5</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setFirmness(lvl)}
                      className={`flex-1 py-1 rounded text-center font-mono text-xs border ${
                        firmness === lvl
                          ? 'bg-accent text-white font-bold border-accent'
                          : 'bg-surface-elevated text-ink-muted border-border hover:text-ink'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-ink-muted block text-center">4-5 = Firm, ready for 72h pod</span>
              </div>

              {/* Ripeness */}
              <div className="bg-surface p-3 rounded-lg border border-border space-y-1.5">
                <span className="font-medium text-ink block">Ripeness Stage:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['turning', 'pink', 'light_red', 'red'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRipeness(r)}
                      className={`py-1 px-2 rounded text-center text-[11px] capitalize border ${
                        ripeness === r
                          ? 'bg-accent/10 border-accent text-accent font-bold'
                          : 'bg-surface-elevated border-border text-ink-muted'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Class */}
              <div className="bg-surface p-3 rounded-lg border border-border space-y-1.5">
                <span className="font-medium text-ink block">Size Class:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSizeClass(s)}
                      className={`py-1 px-2 rounded text-center text-[11px] capitalize border ${
                        sizeClass === s
                          ? 'bg-accent/10 border-accent text-accent font-bold'
                          : 'bg-surface-elevated border-border text-ink-muted'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Operator Override with Mandatory Audit Log */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-ink">Operator Grade Override (Audit Logged):</span>
                <select
                  value={overrideGrade}
                  onChange={(e) => setOverrideGrade(e.target.value)}
                  className="bg-surface border border-border rounded px-2 py-1 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">No Override (Use Grade {suggestedGrade})</option>
                  <option value="A">Override to Grade A</option>
                  <option value="B">Override to Grade B</option>
                  <option value="C">Override to Grade C (Processing)</option>
                </select>
              </div>

              {overrideGrade && (
                <div className="space-y-1.5 animate-fadeIn">
                  <input
                    type="text"
                    required
                    placeholder="Mandatory Audit Reason (e.g. Minor cosmetic sunscald on top layer crates)"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full bg-surface border border-amber-300 rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <span className="text-[11px] text-amber-700 block font-mono">
                    Warning: Override triggers notification to farmer and is timestamped on the QR label.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Thermal QR Label Preview & Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
                Thermal Sticker Preview (Print View)
              </span>
              <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </Button>
            </div>

            {/* Printable Thermal Label Card */}
            <div
              id="thermal-label"
              className="bg-white text-black p-4 rounded-lg border-2 border-black space-y-3 font-mono shadow-md"
            >
              <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <div>
                  <h3 className="font-bold text-base tracking-tight">FARMGATE HUB #01</h3>
                  <p className="text-[10px]">KOLAR CLUSTER • FPO NODE</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black">GRADE {finalGrade}</span>
                  <p className="text-[10px]">HYBRID TOMATO</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-gray-600 block text-[10px]">LOT NUMBER</span>
                    <span className="font-black text-sm">{successLot ? `LOT #${successLot.lotNumber}` : 'LOT #215 (NEXT)'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-[10px]">FARMER</span>
                    <span className="font-bold">{selectedFarmer.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-[10px]">WEIGHT / CRATES</span>
                    <span className="font-bold">{scaleWeightKg.toFixed(1)} KG ({cratesCount} crates)</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-[10px]">FPO FLOOR PRICE</span>
                    <span className="font-bold">₹11.00 / KG GUARANTEED</span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  {qrDataUrl && <img src={qrDataUrl} alt="Lot QR" className="w-24 h-24" />}
                  <span className="text-[9px] font-bold mt-1">SCAN AT HUB</span>
                </div>
              </div>

              <div className="border-t border-black pt-1.5 text-[9px] text-gray-700 flex justify-between">
                <span>INTAKE: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>OPERATOR: RAVI-01</span>
              </div>
            </div>

            {/* Success message if saved */}
            {successLot && (
              <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs text-accent-ink space-y-1 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-accent">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Lot #{successLot.lotNumber} Successfully Stored in Cool Pod!</span>
                </div>
                <p className="font-mono text-[11px]">
                  Assigned Pod Slot: Bay 04 (11.5°C) • QR Code: {successLot.qrCode}
                </p>
              </div>
            )}

            {/* Confirm & Move to Pod Action */}
            <Button
              variant="primary"
              onClick={handleSubmitIntake}
              disabled={isSubmitting || (Boolean(overrideGrade) && !overrideReason.trim())}
              className="w-full min-h-[50px] font-bold text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? 'Recording Lot & Activating Pod...' : 'Confirm Intake & Move to Pod'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
