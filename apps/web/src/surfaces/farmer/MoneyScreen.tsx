import React, { useState } from 'react';
import { Badge, Button } from '@farmgate/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useDemo } from '../../context/DemoContext';
import { useFarmerLots, useFarmerAdvances, useRequestAdvance } from '../../api/client';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatRupees, formatWeightKg } from '@farmgate/shared';

export const MoneyScreen: React.FC = () => {
  const { lang, t } = useLanguage();
  const { activePersona, clockTime } = useDemo();
  const { data: lots } = useFarmerLots(activePersona.id);
  const { data: advances } = useFarmerAdvances(activePersona.id);
  const requestAdvance = useRequestAdvance();

  const [advancePercent, setAdvancePercent] = useState<number>(60);
  const [successReceipt, setSuccessReceipt] = useState<{
    amount: number;
    utr: string;
    lotNumber: number;
  } | null>(null);

  // Eligible lot for advance (IN_POD status)
  const eligibleLot = lots?.find((l) => l.status === 'IN_POD') || lots?.[0];
  const lotWeightKg = (eligibleLot?.weightGrams || 120000) / 1000;
  const estimatedPriceKg = 14.0;
  const estimatedLotValue = lotWeightKg * estimatedPriceKg; // e.g. ₹1,680
  const advanceAmount = Math.round((estimatedLotValue * advancePercent) / 100);
  const advanceFee = Math.round(advanceAmount * 0.01 * 100) / 100; // 1% flat fee
  const netDisbursed = advanceAmount - advanceFee;

  // 24-hour SLA countdown simulation (e.g. 18h 42m remaining)
  const hoursRemaining = 18;
  const minutesRemaining = 42;

  const handleRequestAdvance = () => {
    if (!eligibleLot) return;
    requestAdvance.mutate(
      {
        farmerId: activePersona.id,
        lotId: eligibleLot.id,
        percentage: advancePercent,
        destinationVpa: activePersona.vpa || 'ramesh@okhdfcbank',
      },
      {
        onSuccess: (data) => {
          setSuccessReceipt({
            amount: netDisbursed,
            utr: data.transactionReference || `UPI/ADV-${Math.floor(100000 + Math.random() * 900000)}`,
            lotNumber: eligibleLot.lotNumber,
          });
          setTimeout(() => setSuccessReceipt(null), 8000);
        },
      }
    );
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            {lang === 'hi' ? 'स्क्रीन 4: भुगतान व अग्रिम' : lang === 'ta' ? 'திரை 4: கட்டணம் & முன்பணம்' : 'Screen 4: Money & Advances'}
          </span>
          <h1 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
            {t.screens.money}
            <Badge variant="simulated">LIVE SIM</Badge>
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-ink-muted block">{lang === 'hi' ? 'यूपीआई आईडी' : lang === 'ta' ? 'யுபிஐ ஐடி' : 'UPI VPA'}</span>
          <span className="text-xs font-mono font-bold text-ink">{activePersona.vpa || 'ramesh@okhdfcbank'}</span>
        </div>
      </div>

      {/* 24-Hour SLA Payout Countdown Clock */}
      <div className="bg-surface-elevated border border-border rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
              {t.money.payoutSlaClock}
            </span>
          </div>
          <Badge variant="success" size="sm">
            100% ON-TIME SLA
          </Badge>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-mono font-bold text-accent tracking-tight">
            {hoursRemaining}h {minutesRemaining}m
          </span>
          <span className="text-xs text-ink-muted">{t.money.dueIn} (Max 24h SLA)</span>
        </div>

        <p className="text-xs text-ink-muted mt-2 leading-relaxed">
          {lang === 'hi'
            ? 'सामूहिक बिक्री समाप्त होते ही 24 घंटे के भीतर यूपीआई द्वारा सीधा भुगतान गारंटीकृत है।'
            : lang === 'ta'
            ? 'கூட்டு விற்பனை முடிந்த 24 மணி நேரத்திற்குள் யுபிஐ மூலம் நேரடி கட்டணம் உறுதி செய்யப்படுகிறது.'
            : 'Automated direct UPI disbursement guaranteed within 24 hours of collective load dispatch.'}
        </p>
      </div>

      {/* Instant Advance Request Drawer / Card */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-accent">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold">
                {lang === 'hi' ? 'त्वरित अग्रिम सुविधा' : lang === 'ta' ? 'உடனடி முன்பணம்' : 'Instant Produce Advance'}
              </span>
            </div>
            <h2 className="text-base font-bold text-ink mt-0.5">{t.money.requestAdvanceTitle}</h2>
          </div>
          <Badge variant="neutral">Lot #{eligibleLot?.lotNumber || 214}</Badge>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">{t.money.advanceDescription}</p>

        {/* Value and Percentage Slider */}
        <div className="bg-surface p-4 rounded-lg border border-border space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-ink-muted">Estimated Lot Value:</span>
            <span className="font-mono font-bold text-ink">
              {formatRupees(estimatedLotValue)} ({formatWeightKg(eligibleLot?.weightGrams || 120000)} @ ₹{estimatedPriceKg}/kg)
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-ink">Advance Percentage:</span>
              <span className="font-mono font-bold text-accent text-sm">{advancePercent}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={70}
              step={5}
              value={advancePercent}
              onChange={(e) => setAdvancePercent(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer h-2 bg-border/50 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-ink-muted">
              <span>50% (₹{Math.round(estimatedLotValue * 0.5)})</span>
              <span>60% (Default)</span>
              <span>70% (₹{Math.round(estimatedLotValue * 0.7)})</span>
            </div>
          </div>

          {/* Fee & Net Disbursed calculation */}
          <div className="pt-2 border-t border-border/70 text-xs space-y-1 font-mono">
            <div className="flex justify-between text-ink-muted">
              <span>Gross Advance:</span>
              <span>₹{advanceAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>1% Flat Platform Fee:</span>
              <span>-₹{advanceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-accent pt-1 border-t border-border/50">
              <span>Net UPI Transfer Today:</span>
              <span>₹{netDisbursed.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successReceipt && (
          <div className="p-3.5 bg-accent/10 border border-accent/30 rounded-lg space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-accent">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'hi'
                  ? 'अग्रिम राशि आपके बैंक खाते में भेजी गई!'
                  : lang === 'ta'
                  ? 'முன்பணம் உங்கள் வங்கிக் கணக்கிற்கு அனுப்பப்பட்டது!'
                  : 'Instant Advance Disbursed Successfully!'}
              </span>
            </div>
            <p className="text-xs font-mono text-ink-muted">
              Transferred: <strong>₹{successReceipt.amount}</strong> to {activePersona.vpa} (UTR: {successReceipt.utr})
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="primary"
          onClick={handleRequestAdvance}
          disabled={requestAdvance.isPending}
          className="w-full min-h-[56px] text-sm font-bold flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>
            {requestAdvance.isPending
              ? 'Processing UPI Transfer...'
              : `${t.money.submitAdvance} (₹${netDisbursed})`}
          </span>
        </Button>
      </div>

      {/* Advance & Payment History */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
          {lang === 'hi' ? 'हालिया लेनदेन व इतिहास' : lang === 'ta' ? 'சமீபத்திய பரிவர்த்தனைகள்' : 'Recent Transactions'}
        </h3>

        <div className="space-y-2 text-xs">
          {/* Sample settled payment */}
          <div className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">Lot #198 Final Settlement</span>
                <Badge variant="success" size="sm">PAID</Badge>
              </div>
              <p className="text-ink-muted text-[11px] mt-0.5">UPI/432198004123 • 24h SLA Met</p>
            </div>
            <span className="font-mono font-bold text-ink">+₹1,159.50</span>
          </div>

          {/* Any active advances */}
          {advances?.map((adv) => (
            <div
              key={adv.id}
              className="p-3 bg-surface-elevated rounded-lg border border-border flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink">Lot Advance #{adv.id.slice(-4)}</span>
                  <Badge variant={adv.status === 'SETTLED' ? 'neutral' : 'warning'} size="sm">
                    {adv.status}
                  </Badge>
                </div>
                <p className="text-ink-muted text-[11px] mt-0.5">
                  {adv.status === 'SETTLED' ? 'Recovered from Lot #198 sale' : 'To be recovered upon sale'}
                </p>
              </div>
              <span className="font-mono font-bold text-accent">₹{adv.amountRupees}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
