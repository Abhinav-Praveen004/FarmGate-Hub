import React, { useState } from 'react';
import { TrendingUp, Clock, Volume2, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from './Button.js';
import { Badge } from './Badge.js';
import { formatRupees } from '@farmgate/shared';

export interface SellHoldCardProps {
  cropName: string;
  mandiPriceRupees: number; // e.g. 9.0
  buyerBidRupees: number; // e.g. 14.0
  floorPriceRupees: number; // e.g. 11.0
  forecastLowRupees: number; // e.g. 13.0
  forecastHighRupees: number; // e.g. 15.0
  adviceSentence: string;
  recommendedAction: 'SELL' | 'HOLD' | 'CLOSE_CALL';
  remainingHoldHours?: number;
  onSell: () => void;
  onHold: (hours: number, autoSell: boolean) => void;
  onListen?: () => void;
  isListening?: boolean;
  isSelling?: boolean;
  soldBadgeText?: string;
  className?: string;
}

export const SellHoldCard: React.FC<SellHoldCardProps> = ({
  cropName,
  mandiPriceRupees,
  buyerBidRupees,
  floorPriceRupees,
  forecastLowRupees,
  forecastHighRupees,
  adviceSentence,
  recommendedAction,
  remainingHoldHours = 58,
  onSell,
  onHold,
  onListen,
  isListening = false,
  isSelling = false,
  soldBadgeText,
  className = '',
}) => {
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [selectedHoldHours, setSelectedHoldHours] = useState(48);
  const [autoSell, setAutoSell] = useState(false);

  // Position of floor price marker on the range bar (from mandi price 9 to forecast high 16)
  const minVal = Math.min(mandiPriceRupees, 8);
  const maxVal = Math.max(forecastHighRupees + 1, 16);
  const floorPercent = Math.max(0, Math.min(100, ((floorPriceRupees - minVal) / (maxVal - minVal)) * 100));
  const bidPercent = Math.max(0, Math.min(100, ((buyerBidRupees - minVal) / (maxVal - minVal)) * 100));

  return (
    <div className={`bg-surface-elevated border border-border rounded-lg p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold capitalize text-ink">{cropName} Price Today</h2>
          <Badge variant="simulated">Simulated</Badge>
        </div>
        {onListen && (
          <Button
            variant="outline"
            size="sm"
            icon={<Volume2 className={`w-4 h-4 text-accent ${isListening ? 'animate-bounce text-emerald-600' : ''}`} />}
            onClick={onListen}
            aria-label="Listen to price advice"
          >
            {isListening ? 'Playing...' : 'Listen'}
          </Button>
        )}
      </div>

      {/* Three Price Tiles (Screen 1) */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
        {/* Mandi Price */}
        <div className="bg-surface p-3 rounded-md border border-border-subtle">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Mandi Price</div>
          <div className="text-xl font-extrabold text-ink mt-1 tabular-nums">
            {formatRupees(mandiPriceRupees, 0)}<span className="text-xs font-normal text-ink-muted">/kg</span>
          </div>
          <div className="text-[10px] text-ink-muted mt-1">Local yard today</div>
        </div>

        {/* Best Buyer Bid */}
        <div className="bg-[#eaf4ed] p-3 rounded-md border border-[#1f6b3a]/30">
          <div className="text-[11px] font-semibold text-[#1f6b3a] uppercase tracking-wider">Best Buyer Bid</div>
          <div className="text-2xl font-black text-[#1f6b3a] mt-0.5 tabular-nums">
            {formatRupees(buyerBidRupees, 0)}<span className="text-xs font-normal text-[#1f6b3a]/80">/kg</span>
          </div>
          <div className="text-[10px] text-[#1f6b3a] font-medium mt-0.5">Kirana Network</div>
        </div>

        {/* Hold 1 Day Forecast */}
        <div className="bg-surface p-3 rounded-md border border-border-subtle">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Hold 1 Day</div>
          <div className="text-xl font-extrabold text-ink mt-1 tabular-nums">
            ₹{forecastLowRupees.toFixed(0)}–{forecastHighRupees.toFixed(0)}<span className="text-xs font-normal text-ink-muted">/kg</span>
          </div>
          <div className="text-[10px] text-ink-muted mt-1">Expected tomorrow</div>
        </div>
      </div>

      {/* Range Bar with Collective Floor Marker */}
      <div className="mb-5 bg-surface/70 p-3 rounded-md border border-border-subtle">
        <div className="flex justify-between items-center text-xs text-ink-muted mb-1.5">
          <span>₹{minVal}/kg</span>
          <span className="font-semibold text-ink">Price Horizon vs Floor</span>
          <span>₹{maxVal}/kg</span>
        </div>

        <div className="relative h-4 bg-stone-200 rounded-full overflow-visible">
          {/* Bid bar */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-accent rounded-full transition-all duration-300"
            style={{ width: `${bidPercent}%` }}
          />

          {/* Collective Floor Marker */}
          <div
            className="absolute -top-1 -bottom-1 w-1 bg-amber-600 rounded-sm z-10"
            style={{ left: `${floorPercent}%` }}
          >
            <div className="absolute -top-6 -left-10 bg-amber-700 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              Floor ₹{floorPriceRupees}/kg
            </div>
          </div>
        </div>
      </div>

      {/* Plain Language Advice */}
      <div className="p-3.5 mb-5 rounded-md bg-stone-100 border border-stone-200 text-sm flex items-start gap-2.5">
        {recommendedAction === 'SELL' ? (
          <CheckCircle2 className="w-5 h-5 text-[#1f6b3a] shrink-0 mt-0.5" />
        ) : (
          <Clock className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
        )}
        <div className="leading-snug">
          <span className="font-bold text-ink mr-1">
            {recommendedAction === 'SELL' ? 'Recommendation: SELL' : 'Recommendation: HOLD'}
          </span>
          <span className="text-ink-muted">{adviceSentence}</span>
        </div>
      </div>

      {/* Optional Lot Status Badge (Ready / Sold) */}
      {soldBadgeText && (
        <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-md flex items-center gap-2 text-xs text-emerald-950 font-semibold shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{soldBadgeText}</span>
        </div>
      )}

      {/* Large Action Buttons (≥56px touch target for outdoor use) */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="sell"
          size="touch"
          icon={<TrendingUp className="w-6 h-6 mr-1" />}
          onClick={onSell}
          disabled={isSelling}
          aria-label={`SELL NOW - ${cropName} at ₹${buyerBidRupees}/kg`}
        >
          {isSelling ? 'PROCESSING...' : 'SELL NOW'}
        </Button>

        <Button
          variant="hold"
          size="touch"
          icon={<Clock className="w-6 h-6 mr-1" />}
          onClick={() => setShowHoldModal(true)}
          aria-label={`HOLD IN POD - ${cropName}`}
        >
          HOLD IN POD
        </Button>
      </div>

      {/* HOLD Options Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-2xl border border-border">
            <h3 className="text-lg font-bold text-ink mb-1">Hold Lot in Cool Pod</h3>
            <p className="text-xs text-ink-muted mb-4">
              Holding keeps tomatoes fresh at 11.5°C with solar cooling. Flat storage fee: ₹1.50/kg total.
            </p>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
                Select Hold Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[24, 48, 72].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setSelectedHoldHours(hrs)}
                    className={`py-3 px-2 text-sm font-bold rounded-md border text-center transition-all ${
                      selectedHoldHours === hrs
                        ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent'
                        : 'border-border bg-surface text-ink hover:bg-stone-200'
                    }`}
                  >
                    {hrs} Hours
                  </button>
                ))}
              </div>

              {/* Explicit Opt-in auto sell checkbox (Off by default as required by Rule 5) */}
              <label className="flex items-start gap-2.5 pt-2 text-xs text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSell}
                  onChange={(e) => setAutoSell(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-accent focus:ring-accent"
                />
                <span>Sell automatically at best bid when time expires (off by default)</span>
              </label>
            </div>

            <div className="flex gap-2.5">
              <Button
                variant="outline"
                className="w-1/2 min-h-[48px]"
                onClick={() => setShowHoldModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="hold"
                className="w-1/2 min-h-[48px]"
                onClick={() => {
                  onHold(selectedHoldHours, autoSell);
                  setShowHoldModal(false);
                }}
              >
                Confirm Hold
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
