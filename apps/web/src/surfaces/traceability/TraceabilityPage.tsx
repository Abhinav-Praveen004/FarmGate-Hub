import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@farmgate/ui';
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
} from 'lucide-react';
import { formatWeightKg } from '@farmgate/shared';

export const TraceabilityPage: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const activeCode = code || 'FGH-ANNUR-2026-LOT214';

  return (
    <div className="min-h-screen bg-bg text-ink py-8 px-4 flex justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Certificate Card Header */}
        <div className="bg-surface-elevated border-2 border-accent rounded-2xl p-6 shadow-md space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 text-accent flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
              Verified Farm-Gate Provenance
            </span>
            <h1 className="font-serif font-bold text-2xl text-ink mt-0.5">
              Traceability Certificate
            </h1>
            <p className="font-mono text-xs text-ink-muted mt-1">{activeCode}</p>
          </div>

          <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl flex items-center justify-around text-xs">
            <div>
              <span className="text-ink-muted block text-[10px]">CROP</span>
              <span className="font-bold text-ink">Hybrid Tomato</span>
            </div>
            <div>
              <span className="text-ink-muted block text-[10px]">GRADE</span>
              <span className="font-bold text-accent">Grade A</span>
            </div>
            <div>
              <span className="text-ink-muted block text-[10px]">PRE-COOLED</span>
              <span className="font-bold text-accent">11.5°C Solar Pod</span>
            </div>
          </div>
        </div>

        {/* Farmer Attribution Section */}
        <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center font-serif text-lg font-bold text-accent">
              RC
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-semibold">
                Grown By Smallholder
              </span>
              <h2 className="text-base font-bold text-ink">Ramesh Chandra</h2>
              <p className="text-xs text-ink-muted">Annur Village, Kolar District • 2.0 Acre Family Farm</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-ink-muted block text-[11px]">Harvested:</span>
              <span className="text-ink font-semibold">Today 07:30 AM</span>
            </div>
            <div>
              <span className="text-ink-muted block text-[11px]">Lot Weight:</span>
              <span className="text-ink font-semibold">120.4 kg (5 crates)</span>
            </div>
          </div>
        </div>

        {/* Chronological Audit Trail */}
        <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span>Complete Farm-to-Fork Timeline</span>
          </h3>

          <div className="space-y-4 text-xs relative pl-4 border-l-2 border-accent/30 ml-2">
            <div>
              <div className="flex items-center gap-2 font-bold text-ink">
                <span>07:30 AM</span>
                <span>• Harvested at Farm Gate</span>
              </div>
              <p className="text-ink-muted mt-0.5">Harvested at breaker stage in Annur, packed directly into field crates.</p>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-ink">
                <span>08:30 AM</span>
                <span>• Digital Scale Intake & Grading</span>
              </div>
              <p className="text-ink-muted mt-0.5">Weighed at Kolar Hub #01. Automated grading verified Grade A (Blemish 3.2%).</p>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-accent">
                <span>09:00 AM</span>
                <span>• Solar Cool Pod Pre-cooling (11.5°C)</span>
              </div>
              <p className="text-ink-muted mt-0.5">Field heat eliminated within 45 mins. Stored in solar micro-pod for 14 hours.</p>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-ink">
                <span>14:30 PM</span>
                <span>• Collective Load Dispatch (#CL-04)</span>
              </div>
              <p className="text-ink-muted mt-0.5">Aggregated with 2 other local smallholder lots for wholesale delivery.</p>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-accent">
                <span>16:30 PM</span>
                <span>• Delivered to Annapurna Retail</span>
              </div>
              <p className="text-ink-muted mt-0.5">Inspected & stocked in retail stores within 24 hours of harvest.</p>
            </div>
          </div>
        </div>

        {/* The Fair Share Guarantee */}
        <div className="bg-accent/5 border-2 border-accent/30 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-sm text-ink">Fair Share Payout Transparency</h3>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            On this crate, farmer <strong>Ramesh Chandra</strong> received <strong>₹13.50 / kg</strong> (45% of consumer retail price) disbursed within 24 hours directly via UPI.
          </p>

          <div className="bg-surface-elevated p-3 rounded-lg border border-border text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-muted">Consumer Reference Price:</span>
              <span className="text-ink">₹30.00 / kg</span>
            </div>
            <div className="flex justify-between font-bold text-accent">
              <span>Farmer Realization:</span>
              <span>₹13.50 / kg (45.0%)</span>
            </div>
            <div className="flex justify-between text-ink-muted text-[11px] pt-1 border-t border-border">
              <span>Traditional Mandi Share:</span>
              <span>33.0% (₹9.00 / kg)</span>
            </div>
          </div>
        </div>

        {/* Environmental Proof */}
        <div className="bg-surface border border-border rounded-xl p-4 text-xs text-ink-muted flex items-start gap-2.5">
          <Leaf className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-ink block">73% Lower Post-Harvest Waste</span>
            <p className="mt-0.5 leading-relaxed">
              By cooling at the farm gate, this crate saved 18 kg of food spoilage and eliminated diesel refrigeration transport.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/farmer" className="text-accent text-xs font-bold underline">
            Explore FarmGate Hub Farmer App →
          </Link>
        </div>
      </div>
    </div>
  );
};
