import React, { useState } from 'react';
import { SellHoldCard, Badge, Button } from '@farmgate/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useDemo } from '../../context/DemoContext';
import { useTodayPrice, useFarmerLots, useMakeLotDecision } from '../../api/client';
import { CheckCircle2, Sparkles, TrendingUp, Info, ShieldCheck, X } from 'lucide-react';

const CROPS = [
  { id: 'tomato', emoji: '🍅', en: 'Tomato', hi: 'टमाटर', ta: 'தக்காளி' },
  { id: 'onion', emoji: '🧅', en: 'Onion', hi: 'प्याज़', ta: 'வெங்காயம்' },
  { id: 'potato', emoji: '🥔', en: 'Potato', hi: 'आलू', ta: 'உருளை' },
  { id: 'chilli', emoji: '🌶️', en: 'Chilli', hi: 'मिर्च', ta: 'பச்சை மிளகாய்' },
];

const CROP_VARIANTS: Record<string, { en: string; hi: string; ta: string }> = {
  tomato: { en: 'Hybrid Tomato', hi: 'टमाटर (हाइब्रिड)', ta: 'தக்காளி (ஹைப்ரிட்)' },
  onion: { en: 'Nashik Red Onion', hi: 'प्याज़ (नासिक लाल)', ta: 'வெங்காயம் (நாசிக் சிகப்பு)' },
  potato: { en: 'Kufri Jyoti Potato', hi: 'आलू (कुफरी ज्योति)', ta: 'உருளைக்கிழங்கு (குஃப்ரி ஜோதி)' },
  chilli: { en: 'Guntur Hot Chilli', hi: 'हरी मिर्च (गुंटूर)', ta: 'பச்சை மிளகாய் (குண்டூர்)' },
};

interface TodayPriceScreenProps {
  onNavigateToLots?: () => void;
}

export const TodayPriceScreen: React.FC<TodayPriceScreenProps> = ({ onNavigateToLots }) => {
  const { lang, t, speak, isSpeaking } = useLanguage();
  const { activePersona } = useDemo();
  const [selectedCrop, setSelectedCrop] = useState<string>('tomato');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Pop-up modals state
  const [showSellModal, setShowSellModal] = useState(false);
  const [saleSuccessData, setSaleSuccessData] = useState<{
    lotNumber: number;
    crop: string;
    weightKg: number;
    buyer: string;
    priceRupees: number;
    gross: number;
  } | null>(null);

  const { data: priceData, isLoading } = useTodayPrice(selectedCrop);
  const { data: lots } = useFarmerLots(activePersona.id);
  const makeDecision = useMakeLotDecision();

  // Find lot in pod for this crop if any
  const podLot = lots?.find(
    (l) => l.crop.toLowerCase() === selectedCrop.toLowerCase() && l.status.toUpperCase() === 'IN_POD'
  );

  // Find lot that was already sold/dispatched for this crop
  const soldLot = lots?.find(
    (l) =>
      l.crop.toLowerCase() === selectedCrop.toLowerCase() &&
      (l.status.toUpperCase() === 'SOLD' ||
        l.status.toUpperCase() === 'DISPATCHED' ||
        l.status.toUpperCase() === 'SETTLED' ||
        l.status.toUpperCase() === 'PAID')
  );

  const currentCropVariant =
    CROP_VARIANTS[selectedCrop]?.[lang] || CROP_VARIANTS[selectedCrop]?.en || 'Produce';
  const currentCropSimple =
    CROPS.find((c) => c.id === selectedCrop)?.[lang] || selectedCrop;

  // Open modal on Sell Click
  const handleSellClick = () => {
    setSaleSuccessData(null);
    setShowSellModal(true);
  };

  // Execute sale decision
  const handleConfirmSale = () => {
    if (!podLot) return;

    const salePrice = priceData?.buyerBidRupees || 14.0;
    const weightKg = podLot.weightGrams / 1000;
    const grossVal = weightKg * salePrice;

    makeDecision.mutate(
      {
        lotId: podLot.id,
        decision: 'SELL',
        priceRupees: salePrice,
      },
      {
        onSuccess: () => {
          setSaleSuccessData({
            lotNumber: podLot.lotNumber,
            crop: currentCropSimple,
            weightKg,
            buyer: 'Annapurna Kirana Network',
            priceRupees: salePrice,
            gross: grossVal,
          });

          setFeedbackMessage(
            lang === 'hi'
              ? `लॉट #${podLot.lotNumber} (${currentCropSimple}) को ₹${salePrice}/किग्रा पर बेचने की पुष्टि हुई! डाटा कलेक्टिव लोड में भेज दिया गया है।`
              : lang === 'ta'
              ? `லாட் #${podLot.lotNumber} (${currentCropSimple}) ₹${salePrice}/கிலோ விற்பனைக்கு உறுதி செய்யப்பட்டது! கூட்டு சுமைக்கு அனுப்பப்பட்டது.`
              : `Confirmed sale for Lot #${podLot.lotNumber} (${currentCropSimple}) at ₹${salePrice}/kg! Queued for collective dispatch & payout.`
          );
          setTimeout(() => setFeedbackMessage(null), 8000);
        },
      }
    );
  };

  const handleHold = (hours: number, autoSell: boolean) => {
    if (podLot) {
      makeDecision.mutate(
        { lotId: podLot.id, decision: 'HOLD', holdHours: hours, autoSellAtExpiry: autoSell },
        {
          onSuccess: () => {
            setFeedbackMessage(
              lang === 'hi'
                ? `लॉट #${podLot.lotNumber} (${currentCropSimple}) को कूल पॉड में ${hours} घंटे तक सुरक्षित रखा गया है (न्यूनतम गारंटी ₹${priceData?.floorPriceRupees || 11}/किग्रा)।`
                : lang === 'ta'
                ? `லாட் #${podLot.lotNumber} (${currentCropSimple}) கூல் பாலில் ${hours} மணி நேரம் வைத்திருக்க பதிவு செய்யப்பட்டது.`
                : `Lot #${podLot.lotNumber} (${currentCropSimple}) scheduled to hold in Cool Pod for ${hours}h with ₹${priceData?.floorPriceRupees || 11}/kg floor protection.`
            );
            setTimeout(() => setFeedbackMessage(null), 6000);
          },
        }
      );
    } else {
      setFeedbackMessage(
        lang === 'hi'
          ? `कूल पॉड में रखने के लिए हब पर ${currentCropSimple} लाएं।`
          : lang === 'ta'
          ? `கூல் பாலில் வைக்க உங்கள் ${currentCropSimple}யை ஹப்பிற்கு கொண்டு வாருங்கள்.`
          : `Bring harvest to hub intake to place in Cool Pod storage.`
      );
      setTimeout(() => setFeedbackMessage(null), 6000);
    }
  };

  const handleListen = () => {
    if (!priceData) return;
    const textToSpeak =
      lang === 'hi'
        ? `${currentCropSimple} का आज का मंडी भाव ₹${priceData.mandiPriceRupees} प्रति किलो है। सत्यापित खरीदार बोली ₹${priceData.buyerBidRupees} प्रति किलो है। ${priceData.adviceSentence}`
        : lang === 'ta'
        ? `இன்றைய ${currentCropSimple} மண்டி விலை கிலோவுக்கு ₹${priceData.mandiPriceRupees}. சரிபார்க்கப்பட்ட வாங்குபவர் விலை ₹${priceData.buyerBidRupees}. ${priceData.adviceSentence}`
        : `Today's ${currentCropSimple} mandi price is ₹${priceData.mandiPriceRupees} per kilogram. Best verified buyer bid is ₹${priceData.buyerBidRupees}. ${priceData.adviceSentence}`;
    speak(textToSpeak, lang);
  };

  // Generate live badge text to show right above the buttons in SellHoldCard
  const lotBadgeText = podLot
    ? `📦 Lot #${podLot.lotNumber} in Cool Pod (${(podLot.weightGrams / 1000).toFixed(0)} kg, Grade ${podLot.grade}) • Ready for immediate sale`
    : soldLot
    ? `✅ Lot #${soldLot.lotNumber} (${currentCropSimple}) sold at ₹${soldLot.finalSalePricePaisePerKg ? (soldLot.finalSalePricePaisePerKg / 100).toFixed(1) : priceData?.buyerBidRupees || 14}/kg • Assigned to Collective Loads`
    : undefined;

  return (
    <div className="space-y-4 pb-8 relative">
      {/* Header banner */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            {lang === 'hi' ? 'स्क्रीन 1: आज का भाव' : lang === 'ta' ? 'திரை 1: இன்றைய விலை' : "Screen 1: Today's Price"}
          </span>
          <h1 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
            {t.screens.todayPrice}
            <Badge variant="simulated">LIVE SIM</Badge>
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-ink-muted block">{lang === 'hi' ? 'किसान' : lang === 'ta' ? 'விவசாயி' : 'Farmer'}</span>
          <span className="text-xs font-bold text-ink">{activePersona.name}</span>
        </div>
      </div>

      {/* Crop Selector Cards */}
      <div className="grid grid-cols-4 gap-2">
        {CROPS.map((crop) => {
          const isSelected = selectedCrop === crop.id;
          const label = lang === 'hi' ? crop.hi : lang === 'ta' ? crop.ta : crop.en;
          return (
            <button
              key={crop.id}
              onClick={() => {
                setSelectedCrop(crop.id);
                setFeedbackMessage(null);
              }}
              className={`p-2.5 rounded-lg border text-center transition-all min-h-[56px] flex flex-col items-center justify-center ${
                isSelected
                  ? 'border-accent bg-accent/10 text-accent font-semibold shadow-sm ring-1 ring-accent'
                  : 'border-border bg-surface-elevated text-ink hover:border-border-strong'
              }`}
            >
              <span className="text-xl leading-none mb-1">{crop.emoji}</span>
              <span className="text-xs truncate max-w-full">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Alert if action taken */}
      {feedbackMessage && (
        <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2 text-xs text-ink animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-ink leading-relaxed">{feedbackMessage}</p>
            {onNavigateToLots && (
              <button
                onClick={onNavigateToLots}
                className="mt-1 text-xs font-bold text-accent hover:underline flex items-center gap-1"
              >
                View updated lot in My Lots →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Price Comparison & Advice Card */}
      {isLoading ? (
        <div className="p-8 bg-surface-elevated border border-border rounded-lg text-center animate-pulse">
          <div className="h-6 bg-border/40 rounded w-1/3 mx-auto mb-4" />
          <div className="h-20 bg-border/20 rounded mb-4" />
          <div className="h-10 bg-border/30 rounded" />
        </div>
      ) : (
        <SellHoldCard
          cropName={currentCropVariant}
          mandiPriceRupees={priceData?.mandiPriceRupees || 9.0}
          buyerBidRupees={priceData?.buyerBidRupees || 14.0}
          floorPriceRupees={priceData?.floorPriceRupees || 11.0}
          forecastLowRupees={priceData?.forecastLowRupees || 13.0}
          forecastHighRupees={priceData?.forecastHighRupees || 15.0}
          adviceSentence={
            priceData?.adviceSentence ||
            (lang === 'hi'
              ? `कूल पॉड में 1 दिन रखें: कल दोपहर में ₹${priceData?.forecastLowRupees || 13}-${priceData?.forecastHighRupees || 15}/किग्रा पर मांग सबसे अधिक होगी।`
              : lang === 'ta'
              ? `கூல் பாலில் 1 நாள் வைக்கவும்: நாளை மதியம் ₹${priceData?.forecastLowRupees || 13}-${priceData?.forecastHighRupees || 15}/கிலோ வரை தேவை அதிகரிக்கும்.`
              : `Hold 1 day in cool pod: buyer demand peaks tomorrow afternoon at ₹${priceData?.forecastLowRupees || 13}–${priceData?.forecastHighRupees || 15}/kg.`)
          }
          recommendedAction={priceData?.recommendedAction || 'HOLD'}
          remainingHoldHours={podLot ? 58 : 72}
          onSell={handleSellClick}
          onHold={handleHold}
          onListen={handleListen}
          isListening={isSpeaking}
          isSelling={makeDecision.isPending}
          soldBadgeText={lotBadgeText}
        />
      )}

      {/* Trust & Guarantee footnote */}
      <div className="p-3 bg-surface border border-border rounded-lg text-xs text-ink-muted flex items-start gap-2.5">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-ink">
            {lang === 'hi'
              ? `हब न्यूनतम गारंटी मूल्य ₹${(priceData?.floorPriceRupees || 11.0).toFixed(2)}/किग्रा`
              : lang === 'ta'
              ? `ஹப் குறைந்தபட்ச உத்தரவாத விலை ₹${(priceData?.floorPriceRupees || 11.0).toFixed(2)}/கிலோ`
              : `FPO Guaranteed Floor Price: ₹${(priceData?.floorPriceRupees || 11.0).toFixed(2)}/kg`}
          </p>
          <p className="mt-0.5 leading-relaxed">
            {lang === 'hi'
              ? `यदि बाजार गिरता है, तो हब आपको न्यूनतम ₹${priceData?.floorPriceRupees || 11}/किग्रा देगा। भंडारण शुल्क केवल ₹0.20/किग्रा/दिन।`
              : lang === 'ta'
              ? `சந்தை விலை குறைந்தாலும், ஹப் உங்களுக்கு குறைந்தபட்சம் ₹${priceData?.floorPriceRupees || 11}/கிலோ தரும். சேமிப்பு கட்டணம் ₹0.20/கிலோ/நாள் மட்டுமே.`
              : `Even if mandi crashes tomorrow, you are protected by the ₹${priceData?.floorPriceRupees || 11}/kg floor. Pod storage fee: ₹0.20/kg/day.`}
          </p>
        </div>
      </div>

      {/* POP-UP MODAL: SELL CONFIRMATION & SUCCESS DIALOG */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-border animate-scaleIn">
            {/* Case 1: Sale Confirmed Celebration */}
            {saleSuccessData ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <Badge variant="success" size="sm">
                    SALE ORDER CONFIRMED
                  </Badge>
                  <h3 className="text-lg font-serif font-bold text-ink mt-1">
                    Lot #{saleSuccessData.lotNumber} Locked & Queued!
                  </h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Sold to <strong className="text-ink">{saleSuccessData.buyer}</strong> at{' '}
                    <strong className="text-emerald-700">₹{saleSuccessData.priceRupees.toFixed(1)}/kg</strong>.
                  </p>
                </div>

                {/* Financial breakdown box */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-left text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Weight Sold:</span>
                    <span className="font-bold text-ink">{saleSuccessData.weightKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Agreed Rate:</span>
                    <span className="font-bold text-ink">₹{saleSuccessData.priceRupees}/kg</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-1 text-sm font-bold text-emerald-800">
                    <span>Gross Realization:</span>
                    <span>₹{saleSuccessData.gross.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pipeline next steps */}
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-left text-[11px] space-y-1 text-emerald-950">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Transferred to Hub Console → Collective Loads
                  </p>
                  <p className="flex items-center gap-1.5 text-ink-muted">
                    <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                    24h SLA Payout clock enqueued for direct UPI credit
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-1/2 min-h-[44px]"
                    onClick={() => {
                      setShowSellModal(false);
                      setSaleSuccessData(null);
                    }}
                  >
                    Close
                  </Button>
                  {onNavigateToLots && (
                    <Button
                      variant="primary"
                      className="w-1/2 min-h-[44px]"
                      onClick={() => {
                        setShowSellModal(false);
                        setSaleSuccessData(null);
                        onNavigateToLots();
                      }}
                    >
                      View in My Lots →
                    </Button>
                  )}
                </div>
              </div>
            ) : podLot ? (
              /* Case 2: Active Lot In Pod - Confirmation Dialog */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink">Confirm Immediate Sale</h3>
                      <p className="text-[11px] text-ink-muted">Lock in best wholesale market bid</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="text-ink-muted hover:text-ink p-1 rounded"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Lot & Buyer Order Info */}
                <div className="p-3 bg-surface border border-border rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Lot Selected:</span>
                    <span className="font-bold text-ink">
                      Lot #{podLot.lotNumber} ({currentCropVariant})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Intake Weight & Grade:</span>
                    <span className="font-bold text-ink">
                      {(podLot.weightGrams / 1000).toFixed(0)} kg • Grade {podLot.grade}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Verified Buyer:</span>
                    <span className="font-bold text-accent">Annapurna Kirana Network</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-2">
                    <span className="text-ink-muted">Lock-in Buyer Bid:</span>
                    <span className="text-base font-extrabold text-[#1f6b3a]">
                      ₹{priceData?.buyerBidRupees || 14}/kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-ink-muted text-[11px]">
                    <span>Expected Gross:</span>
                    <span className="font-mono font-bold text-ink">
                      ₹{(((podLot.weightGrams / 1000) * (priceData?.buyerBidRupees || 14))).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Guarantee Banner */}
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-950 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Guaranteed UPI payment settled within 24 hours of collective load dispatch.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="w-1/3 min-h-[48px]"
                    onClick={() => setShowSellModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="sell"
                    className="w-2/3 min-h-[48px]"
                    disabled={makeDecision.isPending}
                    onClick={handleConfirmSale}
                  >
                    {makeDecision.isPending ? 'Locking in...' : `Confirm Sale (₹${priceData?.buyerBidRupees || 14}/kg)`}
                  </Button>
                </div>
              </div>
            ) : (
              /* Case 3: No Active Lot in Pod for this crop */
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                  <Info className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-ink">
                    No Active {currentCropSimple} in Cool Pod
                  </h3>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {soldLot
                      ? `Your Lot #${soldLot.lotNumber} (${currentCropSimple}) has already been sold and is queued in Collective Loads!`
                      : `You do not currently have an unsold ${currentCropSimple} lot in the Cool Pod. To sell, bring your harvest to Hub intake or switch to a crop with stored inventory.`}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-1/2 min-h-[44px]"
                    onClick={() => setShowSellModal(false)}
                  >
                    Close
                  </Button>
                  {onNavigateToLots && (
                    <Button
                      variant="primary"
                      className="w-1/2 min-h-[44px]"
                      onClick={() => {
                        setShowSellModal(false);
                        onNavigateToLots();
                      }}
                    >
                      View My Lots →
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
