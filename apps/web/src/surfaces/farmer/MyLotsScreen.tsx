import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { LotTimeline, Badge, Button } from '@farmgate/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useDemo } from '../../context/DemoContext';
import { useFarmerLots, useMakeLotDecision } from '../../api/client';
import {
  QrCode as QrIcon,
  ShieldCheck,
  Tag,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { formatWeightKg, formatRupees } from '@farmgate/shared';

interface MyLotsScreenProps {
  onNavigateToReceipt?: (lotId: string) => void;
  onNavigateToAdvance?: (lotId: string) => void;
}

export const MyLotsScreen: React.FC<MyLotsScreenProps> = ({
  onNavigateToReceipt,
  onNavigateToAdvance,
}) => {
  const { lang, t } = useLanguage();
  const { activePersona } = useDemo();
  const { data: lots, isLoading } = useFarmerLots(activePersona.id);
  const [selectedLotId, setSelectedLotId] = useState<string>('LOT-214');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Active lot
  const activeLot = lots?.find((l) => l.id === selectedLotId) || lots?.[0];

  // Generate QR code data URL whenever active lot changes
  useEffect(() => {
    if (activeLot) {
      const traceUrl = `${window.location.origin}/t/${activeLot.qrCode}`;
      QRCode.toDataURL(traceUrl, { width: 280, margin: 2 }, (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      });
    }
  }, [activeLot]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-border/40 rounded w-1/3" />
        <div className="h-32 bg-border/20 rounded-lg" />
        <div className="h-64 bg-border/20 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            {lang === 'hi' ? 'स्क्रीन 2: मेरे लॉट' : lang === 'ta' ? 'திரை 2: எனது லாட்டுகள்' : 'Screen 2: My Lots'}
          </span>
          <h1 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
            {t.screens.myLots}
            <Badge variant="simulated">LIVE SIM</Badge>
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-ink-muted block">{lang === 'hi' ? 'कुल लॉट' : lang === 'ta' ? 'மொத்த லாட்' : 'Total Lots'}</span>
          <span className="text-sm font-mono font-bold text-ink">{lots?.length || 0}</span>
        </div>
      </div>

      {/* Lot Selection Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {lots?.map((lot) => {
          const isSelected = lot.id === activeLot?.id;
          const isPod = lot.status === 'IN_POD';
          const isSettled = lot.status === 'SETTLED';
          return (
            <button
              key={lot.id}
              onClick={() => setSelectedLotId(lot.id)}
              className={`px-3 py-2 rounded-lg border text-left shrink-0 transition-all min-h-[48px] ${
                isSelected
                  ? 'border-accent bg-accent/10 ring-1 ring-accent text-accent'
                  : 'border-border bg-surface-elevated text-ink hover:border-border-strong'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs">Lot #{lot.lotNumber}</span>
                <Badge
                  variant={
                    isSettled
                      ? 'success'
                      : isPod
                      ? 'warning'
                      : lot.status === 'DISPATCHED'
                      ? 'accent'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {lot.status}
                </Badge>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {formatWeightKg(lot.weightGrams)} • Grade {lot.grade}
              </p>
            </button>
          );
        })}
      </div>

      {/* Spotlight Card on Active Lot */}
      {activeLot && (
        <div className="space-y-4">
          {/* Quick Actions & QR Code Header */}
          <div className="bg-surface-elevated border border-border rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink">
                  Lot #{activeLot.lotNumber}: {activeLot.crop}
                </h2>
                <Badge variant={activeLot.grade === 'A' ? 'grade_a' : activeLot.grade === 'B' ? 'grade_b' : 'grade_c'}>
                  Grade {activeLot.grade}
                </Badge>
              </div>
              <p className="text-xs text-ink-muted mt-1">
                {formatWeightKg(activeLot.weightGrams)} ({activeLot.cratesCount} crates) • {activeLot.variety}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 shrink-0"
            >
              <QrIcon className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold">{t.myLots.qrCode}</span>
            </Button>
          </div>

          {/* Matched Buyer Spotlight Card */}
          {activeLot.matchedBuyerName && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                      {lang === 'hi' ? 'सत्यापित खरीदार मैच' : lang === 'ta' ? 'சரிபார்க்கப்பட்ட வாங்குபவர் பொருத்தம்' : 'Verified Buyer Match'}
                    </span>
                    <h3 className="text-sm font-bold text-ink">{activeLot.matchedBuyerName}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowMatchModal(true)}
                  className="px-2.5 py-1 bg-accent text-white text-xs font-bold rounded-full hover:bg-accent-hover transition-colors flex items-center gap-1"
                >
                  <span>{activeLot.buyerMatchScore || 78}% Match</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-accent/15 text-xs">
                <div>
                  <span className="text-ink-muted block">{lang === 'hi' ? 'ऑर्डर संदर्भ' : lang === 'ta' ? 'ஆர்டர் குறிப்பு' : 'Buyer Order'}</span>
                  <span className="font-mono font-medium text-ink">{activeLot.matchedOrderId || 'ORD-771'}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">{lang === 'hi' ? 'लक्षित भाव' : lang === 'ta' ? 'விலை' : 'Agreed Bid'}</span>
                  <span className="font-mono font-bold text-accent">₹14.00/kg</span>
                </div>
              </div>
            </div>
          )}

          {/* Lot Timeline signature component */}
          <LotTimeline
            lotNumber={activeLot.lotNumber}
            crop={activeLot.crop}
            weightGrams={activeLot.weightGrams}
            grade={activeLot.grade as 'A' | 'B' | 'C'}
            hoursInPod={activeLot.hoursInPod || 14}
            holdingLimitHours={activeLot.holdingLimitHours || 72}
            qrCode={activeLot.qrCode}
            buyerMatchScore={activeLot.buyerMatchScore || 78}
            buyerMatchBreakdown={
              activeLot.buyerMatchBreakdown || {
                gradeFit: 30,
                quantityFit: 17,
                priceFit: 18,
                deliveryWindowFit: 4,
                reliabilityFit: 9,
              }
            }
            timeline={activeLot.timeline || []}
          />

          {/* Contextual Action Buttons */}
          <div className="flex gap-2">
            {activeLot.status === 'IN_POD' && (
              <Button
                variant="primary"
                onClick={() => onNavigateToAdvance?.(activeLot.id)}
                className="w-full flex items-center justify-center gap-2 py-3"
              >
                <CreditCard className="w-4 h-4" />
                <span>{lang === 'hi' ? 'इस लॉट पर अग्रिम राशि लें' : lang === 'ta' ? 'முன்பணம் கோருங்கள்' : 'Request Advance on this Lot'}</span>
              </Button>
            )}

            {activeLot.status === 'SETTLED' && (
              <Button
                variant="outline"
                onClick={() => onNavigateToReceipt?.(activeLot.id)}
                className="w-full flex items-center justify-center gap-2 py-3"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t.common.receipt}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && activeLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <div className="bg-surface-elevated rounded-xl max-w-sm w-full p-6 border border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">Lot #{activeLot.lotNumber} Traceability</h3>
                <p className="text-xs text-ink-muted">Scan to inspect hub intake & cool pod audit trail</p>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-ink-muted hover:text-ink hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-lg flex flex-col items-center justify-center border border-border">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR Code for Lot #${activeLot.lotNumber}`} className="w-56 h-56" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-ink-muted">Generating QR...</div>
              )}
              <span className="font-mono text-xs text-black mt-2 font-bold tracking-wider">{activeLot.qrCode}</span>
            </div>

            <div className="text-xs text-ink-muted space-y-1 bg-surface p-3 rounded-lg border border-border">
              <div className="flex justify-between">
                <span>Farmer:</span>
                <span className="font-medium text-ink">{activePersona.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight:</span>
                <span className="font-medium text-ink">{formatWeightKg(activeLot.weightGrams)}</span>
              </div>
              <div className="flex justify-between">
                <span>Grade:</span>
                <span className="font-medium text-ink">Grade {activeLot.grade}</span>
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowQrModal(false)} className="w-full">
              {t.common.close}
            </Button>
          </div>
        </div>
      )}

      {/* Match Score Breakdown Modal */}
      {showMatchModal && activeLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <div className="bg-surface-elevated rounded-xl max-w-sm w-full p-6 border border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">Algorithm Breakdown</span>
                <h3 className="font-serif font-bold text-lg text-ink">
                  {activeLot.buyerMatchScore || 78}% Match Fit
                </h3>
              </div>
              <button
                onClick={() => setShowMatchModal(false)}
                className="p-1 rounded-full text-ink-muted hover:text-ink hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-muted">
              Matches Lot #{activeLot.lotNumber} against buyer demand criteria for{' '}
              <strong className="text-ink">{activeLot.matchedBuyerName || 'Annapurna Retail'}</strong> (Order #ORD-771).
            </p>

            <div className="space-y-2.5 text-xs bg-surface p-3.5 rounded-lg border border-border">
              <div>
                <div className="flex justify-between font-medium">
                  <span>Grade & Quality Match</span>
                  <span className="font-mono font-bold text-accent">30 / 30</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium">
                  <span>Quantity Requirement Fit</span>
                  <span className="font-mono font-bold text-accent">17 / 20</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium">
                  <span>Price Target Alignment</span>
                  <span className="font-mono font-bold text-accent">18 / 20</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium">
                  <span>Delivery Window (Dispatch 16:00)</span>
                  <span className="font-mono font-bold text-accent">4 / 10</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium">
                  <span>Buyer Payment Reliability (24h SLA)</span>
                  <span className="font-mono font-bold text-accent">9 / 10</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent-ink">
              Total Score: <strong>78 / 100</strong>. Threshold for collective load auto-assignment is 70.
            </div>

            <Button variant="outline" onClick={() => setShowMatchModal(false)} className="w-full">
              {t.common.close}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
