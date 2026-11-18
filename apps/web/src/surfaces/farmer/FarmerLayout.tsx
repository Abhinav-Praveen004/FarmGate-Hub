import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDemo, PERSONAS } from '../../context/DemoContext';
import { TodayPriceScreen } from './TodayPriceScreen';
import { MyLotsScreen } from './MyLotsScreen';
import { RupeeWaterfallScreen } from './RupeeWaterfallScreen';
import { MoneyScreen } from './MoneyScreen';
import { WhatsAppDrawer } from './WhatsAppDrawer';
import { Badge } from '@farmgate/ui';
import {
  TrendingUp,
  Package,
  FileText,
  CreditCard,
  MessageCircle,
  User,
  Globe,
} from 'lucide-react';
import { Language } from '@farmgate/shared';

export const FarmerLayout: React.FC = () => {
  const { lang, setLang, t } = useLanguage();
  const { activePersona, setPersona } = useDemo();

  const [activeTab, setActiveTab] = useState<'price' | 'lots' | 'receipt' | 'money'>('price');
  const [selectedReceiptLotId, setSelectedReceiptLotId] = useState<string>('LOT-198');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center">
      {/* Mobile Shell Container (360px - 440px native feel) */}
      <main className="w-full max-w-md flex-1 flex flex-col bg-surface-elevated sm:border-x border-border sm:shadow-lg min-h-[calc(100vh-45px)] relative">
        {/* Top Header */}
        <header className="p-4 border-b border-border space-y-3 bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-accent flex items-center justify-center font-serif font-bold text-white text-sm">
                F
              </div>
              <span className="font-serif font-bold text-base tracking-tight text-ink">
                FarmGate Hub
              </span>
              <Badge variant="simulated">SIM</Badge>
            </div>

            {/* Language Selector (3 Languages) */}
            <div className="flex items-center bg-surface-elevated rounded-lg p-0.5 border border-border">
              {(['en', 'hi', 'ta'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                    lang === l
                      ? 'bg-accent text-white font-bold shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : 'தமிழ்'}
                </button>
              ))}
            </div>
          </div>

          {/* Persona Switcher Pill */}
          <div className="flex items-center justify-between bg-surface-elevated p-2 rounded-lg border border-border text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent" />
              <div>
                <span className="font-bold text-ink">{activePersona.name}</span>
                <span className="text-[11px] text-ink-muted block">{activePersona.description}</span>
              </div>
            </div>

            <select
              aria-label="Select Farmer Persona"
              value={activePersona.id}
              onChange={(e) => {
                const found = PERSONAS.find((p) => p.id === e.target.value);
                if (found) setPersona(found);
              }}
              className="bg-surface border border-border text-xs rounded px-2 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer"
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 pb-24 overflow-y-auto">
          {activeTab === 'price' && (
            <TodayPriceScreen onNavigateToLots={() => setActiveTab('lots')} />
          )}
          {activeTab === 'lots' && (
            <MyLotsScreen
              onNavigateToReceipt={(lotId) => {
                setSelectedReceiptLotId(lotId);
                setActiveTab('receipt');
              }}
              onNavigateToAdvance={() => {
                setActiveTab('money');
              }}
            />
          )}
          {activeTab === 'receipt' && (
            <RupeeWaterfallScreen
              lotId={selectedReceiptLotId}
              onBack={() => setActiveTab('lots')}
            />
          )}
          {activeTab === 'money' && <MoneyScreen />}
        </div>

        {/* Floating WhatsApp FAB */}
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="fixed bottom-20 right-4 sm:right-[calc(50%-200px)] z-30 w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:bg-[#20ba59] active:scale-95 transition-all"
          title="Open WhatsApp Alert Simulator"
          aria-label="Open WhatsApp Alert Simulator"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* WhatsApp Slide-Over Simulator */}
        <WhatsAppDrawer isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} />

        {/* Bottom Tab Bar (≥48px touch targets) */}
        <nav className="fixed bottom-0 max-w-md w-full bg-surface-elevated border-t border-border z-30 flex items-center justify-around py-2 px-2 shadow-lg">
          <button
            onClick={() => setActiveTab('price')}
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] rounded-lg transition-colors ${
              activeTab === 'price' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] truncate">{t.screens.todayPrice}</span>
          </button>

          <button
            onClick={() => setActiveTab('lots')}
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] rounded-lg transition-colors ${
              activeTab === 'lots' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] truncate">{t.screens.myLots}</span>
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] rounded-lg transition-colors ${
              activeTab === 'receipt' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] truncate">{lang === 'hi' ? 'रसीद' : lang === 'ta' ? 'ரசீது' : 'Receipt'}</span>
          </button>

          <button
            onClick={() => setActiveTab('money')}
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] rounded-lg transition-colors ${
              activeTab === 'money' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] truncate">{lang === 'hi' ? 'पैसे' : lang === 'ta' ? 'பணம்' : 'Money'}</span>
          </button>
        </nav>
      </main>
    </div>
  );
};
