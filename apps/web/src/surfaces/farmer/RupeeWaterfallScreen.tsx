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
  Layers,
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
  const [selectedLot, setSelectedLot] = useState<string>(lotId);
  const { data: receipt, isLoading } = useReceiptByLot(selectedLot);
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

  // Dynamic lot configuration
  const isLot198 = selectedLot === 'LOT-198';
  const isLot210 = selectedLot === 'LOT-210';
  const isLot214 = selectedLot === 'LOT-214';

  const lotMeta = isLot198
    ? {
        title: 'Lot #198: 100 kg Hybrid Tomato (Grade A)',
        code: 'RECEIPT #RCP-198-SETTLED',
        status: 'PAID IN 24H',
        statusVariant: 'success' as const,
        consumerPrice: 30.0,
        farmerGross: 13.5,
        sharePct: 45,
        hubFee: 1.9,
        farmerNet: 11.6,
        transport: 3.0,
        handling: 3.5,
        margin: 10.0,
        grossSale: 1350.0,
        fees: 190.5,
        advance: 0,
        netPaid: 1159.5,
        txFarmer: 'TX-198-FARMER-CR',
        txFarmerVal: '+₹1,350.00',
        txHub: 'TX-198-HUB-FEE',
        txHubVal: '-₹190.50',
        txUpi: 'TX-198-UPI-SETTLED',
        txUpiVal: '₹1,159.50 (UTR: UPI/432198004123)',
      }
    : isLot210
    ? {
        title: 'Lot #210: 150 kg Desi Tomato (Grade A)',
        code: 'RECEIPT #RCP-210-SETTLED',
        status: 'PAID IN 24H',
        statusVariant: 'success' as const,
        consumerPrice: 28.0,
        farmerGross: 12.6,
        sharePct: 45,
        hubFee: 1.88,
        farmerNet: 10.72,
        transport: 2.8,
        handling: 3.2,
        margin: 9.4,
        grossSale: 1890.0,
        fees: 282.0,
        advance: 0,
        netPaid: 1608.0,
        txFarmer: 'TX-210-FARMER-CR',
        txFarmerVal: '+₹1,890.00',
        txHub: 'TX-210-HUB-FEE',
        txHubVal: '-₹282.00',
        txUpi: 'TX-210-UPI-SETTLED',
        txUpiVal: '₹1,608.00 (UTR: UPI/432210008892)',
      }
    : {
        title: 'Lot #214: 120 kg Hybrid Tomato (Grade A)',
        code: 'RECEIPT #RCP-214-PENDING',
        status: 'ESCROW LOCKED',
        statusVariant: 'warning' as const,
        consumerPrice: 32.0,
        farmerGross: 14.4,
        sharePct: 45,
        hubFee: 1.93,
        farmerNet: 12.47,
        transport: 3.2,
        handling: 3.5,
        margin: 10.9,
        grossSale: 1728.0,
        fees: 231.6,
        advance: 720.0,
        netPaid: 776.4,
        txFarmer: 'TX-214-FARMER-CR',
        txFarmerVal: '+₹1,728.00',
        txHub: 'TX-214-HUB-FEE',
        txHubVal: '-₹231.60',
        txUpi: 'TX-214-ESCROW-HOLD',
        txUpiVal: '₹776.40 (Due upon delivery)',
      };

  return (
    <div className="space-y-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface"
              aria-label="Go back"
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleListen}
            className="flex items-center gap-1.5"
            aria-label="Listen to receipt breakdown"
          >
            <Volume2 className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs">{lang === 'hi' ? 'सुनें' : lang === 'ta' ? 'கேளுங்கள்' : 'Listen'}</span>
          </Button>

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
      </div>

      {/* Lot Switcher Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedLot('LOT-198')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            selectedLot === 'LOT-198'
              ? 'bg-accent text-white shadow-xs'
              : 'bg-surface border border-border text-ink-muted hover:text-ink'
          }`}
        >
          Lot #198 (Settled)
        </button>
        <button
          onClick={() => setSelectedLot('LOT-210')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            selectedLot === 'LOT-210'
              ? 'bg-accent text-white shadow-xs'
              : 'bg-surface border border-border text-ink-muted hover:text-ink'
          }`}
        >
          Lot #210 (Settled)
        </button>
        <button
          onClick={() => setSelectedLot('LOT-214')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            selectedLot === 'LOT-214'
              ? 'bg-accent text-white shadow-xs'
              : 'bg-surface border border-border text-ink-muted hover:text-ink'
          }`}
        >
          Lot #214 (In Pod)
        </button>
      </div>

      {/* Lot Metadata Banner */}
      <div className="bg-surface-elevated border border-border rounded-lg p-3.5 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-accent">{lotMeta.code}</span>
          <p className="text-sm font-bold text-ink">{lotMeta.title}</p>
          <p className="text-xs text-ink-muted">Farmer: {activePersona.name} • UPI: {activePersona.vpa || 'ramesh@okhdfcbank'}</p>
        </div>
        <Badge variant={lotMeta.statusVariant} size="md">
          {lotMeta.status}
        </Badge>
      </div>

      {/* Rupee Waterfall Signature Component (showHeader=false eliminates duplicate header) */}
      <RupeeWaterfall
        showHeader={false}
        consumerReferencePriceRupees={lotMeta.consumerPrice}
        farmerGrossPriceRupees={lotMeta.farmerGross}
        farmerSharePercent={lotMeta.sharePct}
        hubFeeRupees={lotMeta.hubFee}
        netPaidToFarmerRupees={lotMeta.farmerNet}
        transportCostRupees={lotMeta.transport}
        handlingLossRupees={lotMeta.handling}
        intermediaryMarginRupees={lotMeta.margin}
        grossSaleTotalRupees={lotMeta.grossSale}
        feesDeductedTotalRupees={lotMeta.fees}
        advanceDeductedTotalRupees={lotMeta.advance}
        netPaidTotalRupees={lotMeta.netPaid}
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
            <span>{lotMeta.txFarmer}</span>
            <span className="text-ink font-semibold">{lotMeta.txFarmerVal} (Farmer Account)</span>
          </div>
          <div className="flex justify-between">
            <span>{lotMeta.txHub}</span>
            <span className="text-ink font-semibold">{lotMeta.txHubVal} (Hub Operations)</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-bold text-ink">
            <span>{lotMeta.txUpi}</span>
            <span className="text-accent">{lotMeta.txUpiVal}</span>
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
