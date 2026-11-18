import React, { useState } from 'react';
import { RupeeWaterfall, Badge, Button } from '@farmgate/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useDemo } from '../../context/DemoContext';
import { useReceiptByLot } from '../../api/client';
import {
  FileText,
  Volume2,
  Printer,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { formatRupees, formatWeightKg } from '@farmgate/shared';

interface RupeeWaterfallScreenProps {
  lotId?: string;
  onBack?: () => void;
}

export const RupeeWaterfallScreen: React.FC<RupeeWaterfallScreenProps> = ({
  lotId = 'LOT-198',
  onBack,
}) => {
  const { lang, t, speak, isSpeaking } = useLanguage();
  const { activePersona } = useDemo();
  const { data: receipt, isLoading } = useReceiptByLot(lotId);
  const [isExporting, setIsExporting] = useState(false);

  // Audio readout in chosen language
  const handleListen = () => {
    const textToSpeak =
      lang === 'hi'
        ? 'आपके टमाटर की बिक्री पर उपभोक्ता ने तीस रुपये प्रति किलो चुकाए। आपको साढ़े तेरह रुपये यानी पैंतालीस प्रतिशत मिले। पारंपरिक मंडी में केवल तैंतीस प्रतिशत मिलता था। हब शुल्क एक रुपया नब्बे पैसे कटने के बाद आपके बैंक खाते में ग्यारह रुपये साठ पैसे प्रति किलो जमा हुए।'
        : lang === 'ta'
        ? 'உங்கள் தக்காளி விற்பனையில் நுகர்வோர் ஒரு கிலோவுக்கு முப்பது ரூபாய் கொடுத்தார். உங்களுக்கு பதின்மூன்று ரூபாய் ஐம்பது காசு அதாவது நாற்பத்தைந்து சதவீதம் கிடைத்தது. பாரம்பரிய மண்டியில் முப்பத்து மூன்று சதவீதம் மட்டுமே கிடைக்கும். ஹப் கட்டணம் கழித்து உங்கள் வங்கிக் கணக்கில் பதினொரு ரூபாய் அறுபது காசு செலுத்தப்பட்டது.'
        : 'On your tomato sale, consumer paid 30 rupees per kg. You realized 13 rupees 50 paise, which is 45 percent of consumer price, compared to 33 percent typical share without the hub. After hub fee of 1 rupee 90 paise, net payout to your account is 11 rupees 60 paise per kg.';

    speak(textToSpeak, lang);
  };

  const handlePrint = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 300);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
              {lang === 'hi' ? 'स्क्रीन 3: पारदर्शी रसीद' : lang === 'ta' ? 'திரை 3: வெளிப்படையான ரசீது' : 'Screen 3: Transparent Receipt'}
            </span>
            <h1 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
              {t.screens.rupeeWaterfall}
              <Badge variant="simulated">LIVE SIM</Badge>
            </h1>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="text-xs">{lang === 'hi' ? 'प्रिंट' : lang === 'ta' ? 'அச்சிடு' : 'Print'}</span>
        </Button>
      </div>

      {/* Lot Metadata Banner */}
      <div className="bg-surface-elevated border border-border rounded-lg p-3.5 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-accent">RECEIPT #RCP-198-SETTLED</span>
          <p className="text-sm font-bold text-ink">Lot #198: 100 kg Hybrid Tomato (Grade A)</p>
          <p className="text-xs text-ink-muted">Farmer: {activePersona.name} • UPI: {activePersona.vpa || 'ramesh@okhdfcbank'}</p>
        </div>
        <Badge variant="success" size="md">
          PAID IN 24H
        </Badge>
      </div>

      {/* Rupee Waterfall Signature Component */}
      <RupeeWaterfall
        consumerReferencePriceRupees={30.0}
        farmerGrossPriceRupees={13.5}
        farmerSharePercent={45}
        hubFeeRupees={1.9}
        netPaidToFarmerRupees={11.6}
        transportCostRupees={3.0}
        handlingLossRupees={3.5}
        intermediaryMarginRupees={10.0}
        grossSaleTotalRupees={1350.0}
        feesDeductedTotalRupees={190.5}
        advanceDeductedTotalRupees={0}
        netPaidTotalRupees={1159.5}
        onListen={handleListen}
        language={lang}
      />

      {/* Double-entry Ledger Audit Proof */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
              {lang === 'hi' ? 'दोहरी प्रविष्टि लेजर प्रमाण' : lang === 'ta' ? 'இரட்டைப் பதிவு லெட்ஜர் சான்று' : 'Double-Entry Ledger Audit'}
            </span>
          </div>
          <Badge variant="success" size="sm">
            Delta: ₹0.00 Balanced
          </Badge>
        </div>

        <div className="space-y-1.5 font-mono text-xs text-ink-muted bg-surface-elevated p-3 rounded border border-border">
          <div className="flex justify-between">
            <span>TX-198-FARMER-CR</span>
            <span className="text-ink font-semibold">+₹1,350.00 (Farmer Account)</span>
          </div>
          <div className="flex justify-between">
            <span>TX-198-HUB-FEE</span>
            <span className="text-ink font-semibold">-₹190.50 (Hub Operations)</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-bold text-ink">
            <span>TX-198-UPI-SETTLED</span>
            <span className="text-accent">₹1,159.50 (UTR: UPI/432198004123)</span>
          </div>
        </div>

        <p className="text-xs text-ink-muted flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>
            {lang === 'hi'
              ? 'सभी लेनदेन ब्लॉक-स्तरीय लेज़र में दर्ज हैं। किसी मध्यस्थ का छुपा हुआ कमीशन नहीं।'
              : lang === 'ta'
              ? 'அனைத்து பரிவர்த்தனைகளும் லெட்ஜரில் பதிவு செய்யப்பட்டுள்ளன. மறைமுக கட்டணங்கள் இல்லை.'
              : 'Zero hidden intermediary cuts. Every single rupee is reconciled in real-time.'}
          </span>
        </p>
      </div>
    </div>
  );
};
