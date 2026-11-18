import React, { useState } from 'react';
import { SellHoldCard, Badge } from '@farmgate/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useDemo } from '../../context/DemoContext';
import { useTodayPrice, useFarmerLots, useMakeLotDecision } from '../../api/client';
import { CheckCircle2, Sparkles, TrendingUp, Info } from 'lucide-react';

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

export const TodayPriceScreen: React.FC = () => {
  const { lang, t, speak, isSpeaking } = useLanguage();
  const { activePersona } = useDemo();
  const [selectedCrop, setSelectedCrop] = useState<string>('tomato');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const { data: priceData, isLoading } = useTodayPrice(selectedCrop);
  const { data: lots } = useFarmerLots(activePersona.id);
  const makeDecision = useMakeLotDecision();

  // Find lot in pod for this crop if any
  const podLot = lots?.find(
    (l) => l.crop.toLowerCase() === selectedCrop.toLowerCase() && l.status.toUpperCase() === 'IN_POD'
  );

  const currentCropVariant =
    CROP_VARIANTS[selectedCrop]?.[lang] || CROP_VARIANTS[selectedCrop]?.en || 'Produce';
  const currentCropSimple =
    CROPS.find((c) => c.id === selectedCrop)?.[lang] || selectedCrop;

  const handleSell = () => {
    if (podLot) {
      makeDecision.mutate(
        {
          lotId: podLot.id,
          decision: 'SELL',
          priceRupees: priceData?.buyerBidRupees || 14.0,
        },
        {
          onSuccess: () => {
            setFeedbackMessage(
              lang === 'hi'
                ? `लॉट #${podLot.lotNumber} (${currentCropSimple}) को ₹${priceData?.buyerBidRupees || 14}/किग्रा के भाव पर बेचने की पुष्टि हुई! डाटा कलेक्टिव लोड में भेज दिया गया है।`
                : lang === 'ta'
                ? `லாட் #${podLot.lotNumber} (${currentCropSimple}) ₹${priceData?.buyerBidRupees || 14}/கிலோ விற்பனைக்கு உறுதி செய்யப்பட்டது! கூட்டு சுமைக்கு அனுப்பப்பட்டது.`
                : `Confirmed sale for Lot #${podLot.lotNumber} (${currentCropSimple}) at ₹${priceData?.buyerBidRupees || 14}/kg! Queued for collective dispatch & payout.`
            );
            setTimeout(() => setFeedbackMessage(null), 6000);
          },
        }
      );
    } else {
      setFeedbackMessage(
        lang === 'hi'
          ? `आपके पास कूल पॉड में कोई सक्रिय ${currentCropSimple} लॉट नहीं है। नया लॉट लाने के लिए हब पर जाएं या व्हाट्सएप पर स्लॉट बुक करें।`
          : lang === 'ta'
          ? `கூல் பாலில் உங்களிடம் ${currentCropSimple} லாட் இல்லை. புதிய அறுவடையை கொண்டு வர ஹப்பிற்கு வரவும்.`
          : `No active ${currentCropSimple} lot currently in the Cool Pod. Visit Hub for intake or message on WhatsApp to reserve a delivery slot.`
      );
      setTimeout(() => setFeedbackMessage(null), 6000);
    }
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

  return (
    <div className="space-y-4 pb-8">
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
              onClick={() => setSelectedCrop(crop.id)}
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
          <p className="font-semibold text-ink leading-relaxed">{feedbackMessage}</p>
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
          onSell={handleSell}
          onHold={handleHold}
          onListen={handleListen}
          isListening={isSpeaking}
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
    </div>
  );
};
