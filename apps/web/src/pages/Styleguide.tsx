import React, { useState } from 'react';
import {
  RupeeWaterfall,
  SellHoldCard,
  LotTimeline,
  PodGauge,
  LeakyBucket,
  FinanceTable,
  Button,
  Badge,
} from '@farmgate/ui';
import { calculateNetworkModel, SEED_POD_TELEMETRY } from '@farmgate/shared';

export const StyleguidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'components' | 'tokens'>('components');
  const [telemetry, setTelemetry] = useState(SEED_POD_TELEMETRY);
  const [speechMsg, setSpeechMsg] = useState<string | null>(null);

  const handleSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      setSpeechMsg('Speaking audio...');
      setTimeout(() => setSpeechMsg(null), 3500);
    } else {
      setSpeechMsg('Speech synthesis unavailable on this device.');
      setTimeout(() => setSpeechMsg(null), 3000);
    }
  };

  const sampleNetwork = calculateNetworkModel();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Design Foundations & Tokens</span>
          <h1 className="text-3xl font-display font-bold text-ink">FarmGate Hub Styleguide</h1>
          <p className="text-sm text-ink-muted mt-1">
            Dealt palette <code className="bg-surface px-1.5 py-0.5 rounded font-mono">mint-pink-accounts</code> with typography and signature components.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="simulated">Simulated UI</Badge>
          <div className="flex bg-surface rounded-md p-1 border border-border">
            <button
              onClick={() => setActiveTab('components')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                activeTab === 'components' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted'
              }`}
            >
              Components
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                activeTab === 'tokens' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted'
              }`}
            >
              Tokens & Palette
            </button>
          </div>
        </div>
      </div>

      {speechMsg && (
        <div className="fixed top-5 right-5 z-50 bg-ink text-white px-4 py-2 rounded-md shadow-lg text-xs font-mono animate-fade-in">
          {speechMsg}
        </div>
      )}

      {activeTab === 'tokens' ? (
        /* Tokens Section */
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-3 text-ink">Color Palette Tokens</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <div className="p-3 bg-page border border-border rounded-md">
                <div className="h-12 w-full rounded bg-[#f8f8f8] border border-stone-300 mb-2" />
                <div className="text-xs font-bold">Page Background</div>
                <div className="text-[11px] font-mono text-ink-muted">#f8f8f8</div>
              </div>
              <div className="p-3 bg-surface border border-border rounded-md">
                <div className="h-12 w-full rounded bg-[#eeeeee] border border-stone-300 mb-2" />
                <div className="text-xs font-bold">Surface Ground</div>
                <div className="text-[11px] font-mono text-ink-muted">#eeeeee</div>
              </div>
              <div className="p-3 bg-surface-elevated border border-border rounded-md">
                <div className="h-12 w-full rounded bg-[#1f6b3a] mb-2" />
                <div className="text-xs font-bold text-accent">Accent & Action</div>
                <div className="text-[11px] font-mono text-ink-muted">#1f6b3a</div>
              </div>
              <div className="p-3 bg-surface-elevated border border-border rounded-md">
                <div className="h-12 w-full rounded bg-[#b45309] mb-2" />
                <div className="text-xs font-bold text-amber-700">Hold & Alert</div>
                <div className="text-[11px] font-mono text-ink-muted">#b45309</div>
              </div>
              <div className="p-3 bg-surface-elevated border border-border rounded-md">
                <div className="h-12 w-full rounded bg-[#0a0a0a] mb-2" />
                <div className="text-xs font-bold">Ink Text</div>
                <div className="text-[11px] font-mono text-ink-muted">#0a0a0a</div>
              </div>
              <div className="p-3 bg-surface-elevated border border-border rounded-md">
                <div className="h-12 w-full rounded bg-[#b91c1c] mb-2" />
                <div className="text-xs font-bold text-red-700">Grade C Processing</div>
                <div className="text-[11px] font-mono text-ink-muted">#b91c1c</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-ink">Multilingual Typography Stack</h2>
            <div className="space-y-4">
              <div className="p-4 bg-surface rounded-md">
                <span className="text-xs text-ink-muted font-mono uppercase">English (Instrument Sans)</span>
                <p className="text-lg font-medium text-ink mt-1">
                  Keep the Harvest, Keep the Value. A cold room, a grading shed and an honest price at the farm gate.
                </p>
              </div>
              <div className="p-4 bg-surface rounded-md">
                <span className="text-xs text-ink-muted font-mono uppercase">Hindi (Noto Sans Devanagari)</span>
                <p className="text-lg font-medium text-ink mt-1" style={{ fontFamily: 'var(--font-devanagari)' }}>
                  फसल भी सुरक्षित, पूरा मूल्य भी। खेत के मुहाने पर सोलर कूल पॉड और पारदर्शी मंडी भाव।
                </p>
              </div>
              <div className="p-4 bg-surface rounded-md">
                <span className="text-xs text-ink-muted font-mono uppercase">Tamil (Noto Sans Tamil)</span>
                <p className="text-lg font-medium text-ink mt-1" style={{ fontFamily: 'var(--font-tamil)' }}>
                  அறுவடையும் காப்போம், உரிய விலையும் பெறுவோம். பண்ணை வாசலிலேயே குளிர்பதன பாதுகாப்பு மற்றும் வெளிப்படையான விலை.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Signature Components Section */
        <div className="space-y-12">
          {/* 1. Rupee Waterfall */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">1. RupeeWaterfall (Signature Component 1)</h2>
              <span className="text-xs font-mono text-ink-muted">Section 6.7 & 8.3</span>
            </div>
            <RupeeWaterfall
              consumerReferencePriceRupees={30.0}
              farmerGrossPriceRupees={13.5}
              farmerSharePercent={45}
              hubFeeRupees={1.9}
              netPaidToFarmerRupees={11.6}
              onListen={() =>
                handleSpeech(
                  'Consumer paid ₹30 per kilogram. You realised ₹13.50, which is 45 percent. Hub fee is ₹1.90. Net transferred to your bank is ₹11.60 per kilogram.'
                )
              }
            />
          </section>

          {/* 2. Sell Hold Card */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">2. SellHoldCard (Signature Component 2)</h2>
              <span className="text-xs font-mono text-ink-muted">Screen 1 Price & Advice</span>
            </div>
            <SellHoldCard
              cropName="Tomato"
              mandiPriceRupees={9.0}
              buyerBidRupees={14.0}
              floorPriceRupees={11.0}
              forecastLowRupees={13.0}
              forecastHighRupees={15.0}
              adviceSentence="Buyer bid of ₹14/kg is above the FPO floor (₹11/kg) and matches strong 24h market outlook. Recommend selling now."
              recommendedAction="SELL"
              onSell={() => alert('Sell action confirmed!')}
              onHold={(hours, autoSell) => alert(`Hold confirmed for ${hours} hours (Auto-sell: ${autoSell})`)}
              onListen={() =>
                handleSpeech(
                  'Tomato mandi price is ₹9. Best buyer bid is ₹14. Expected price tomorrow is ₹13 to ₹15. Recommendation: SELL NOW.'
                )
              }
            />
          </section>

          {/* 3. Lot Timeline */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">3. LotTimeline (Signature Component 3)</h2>
              <span className="text-xs font-mono text-ink-muted">Screen 2 Lot #214</span>
            </div>
            <LotTimeline
              lotNumber={214}
              crop="tomato"
              weightGrams={120_000}
              grade="A"
              hoursInPod={14}
              qrCode="FGH-ANNUR-2026-LOT214"
              buyerMatchScore={78}
              buyerMatchBreakdown={{
                gradeFit: 30,
                quantityFit: 17,
                priceFit: 18,
                deliveryWindowFit: 4,
                reliabilityFit: 9,
              }}
              timeline={[
                { timestamp: '2026-11-17T16:00:00Z', status: 'received', actor: 'Ravi', note: 'Weighed 120 kg' },
                { timestamp: '2026-11-17T16:15:00Z', status: 'graded', actor: 'Ravi', note: 'Graded A: blemish 3%, firmness 4/5' },
                { timestamp: '2026-11-17T16:20:00Z', status: 'in_pod', actor: 'System', note: 'Stored in bay A-3 at 11.5°C' },
              ]}
            />
          </section>

          {/* 4. Pod Gauge */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">4. PodGauge (Signature Component 4)</h2>
              <span className="text-xs font-mono text-ink-muted">Cool Pod Telemetry</span>
            </div>
            <PodGauge
              telemetry={telemetry}
              onSimulatePowerCut={() => setTelemetry({ ...telemetry, gridActive: false, temperatureCelsius: 12.8 })}
              onRestoreGrid={() => setTelemetry({ ...telemetry, gridActive: true, temperatureCelsius: 11.4 })}
              onSimulateDoorOpen={() => setTelemetry({ ...telemetry, doorOpen: !telemetry.doorOpen })}
            />
          </section>

          {/* 5. Leaky Bucket Illustration */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">5. LeakyBucket (Signature Component 5)</h2>
              <span className="text-xs font-mono text-ink-muted">Signature Brand Artwork</span>
            </div>
            <LeakyBucket />
          </section>

          {/* 6. Finance Table */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">6. FinanceTable (Signature Component 6)</h2>
              <span className="text-xs font-mono text-ink-muted">Section 4.7 Model Table</span>
            </div>
            <FinanceTable years={sampleNetwork} matchesReport={true} />
          </section>
        </div>
      )}
    </div>
  );
};
