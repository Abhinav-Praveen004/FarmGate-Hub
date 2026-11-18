import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext.js';
import { DemoProvider } from './context/DemoContext.js';
import { FarmerLayout } from './surfaces/farmer/FarmerLayout.js';
import { HubLayout } from './surfaces/hub/HubLayout.js';
import { ImpactLayout } from './surfaces/impact/ImpactLayout.js';
import { BuyerPortal } from './surfaces/buyer/BuyerPortal.js';
import { TraceabilityPage } from './surfaces/traceability/TraceabilityPage.js';
import { ChannelsSimulator } from './surfaces/channels/ChannelsSimulator.js';
import { SourcesPage } from './surfaces/sources/SourcesPage.js';
import { StyleguidePage } from './pages/Styleguide.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const TopNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const NAV_ITEMS = [
    { label: 'Farmer App', path: '/farmer', isActive: pathname.startsWith('/farmer') },
    { label: 'Hub Console', path: '/hub', isActive: pathname.startsWith('/hub') },
    { label: 'Buyer Portal', path: '/buyer', isActive: pathname.startsWith('/buyer') },
    { label: 'QR Traceability', path: '/t/FGH-ANNUR-2026-LOT214', isActive: pathname.startsWith('/t') },
    { label: 'Channels / IVR', path: '/channels', isActive: pathname.startsWith('/channels') },
    { label: 'Impact Dashboard', path: '/impact', isActive: pathname.startsWith('/impact') },
    { label: 'Sources', path: '/sources', isActive: pathname.startsWith('/sources') },
    { label: 'Tokens', path: '/styleguide', isActive: pathname.startsWith('/styleguide'), isMono: true },
  ];

  return (
    <header className="sticky top-0 z-50 h-14 bg-white/95 backdrop-blur-md border-b border-border shadow-xs px-4 sm:px-6">
      <div className="max-w-[1500px] h-full mx-auto flex items-center justify-between gap-4">
        {/* Brand & Suite Logo */}
        <Link to="/farmer" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-serif font-black text-base shadow-xs group-hover:bg-[#1a5b31] transition-colors">
            F
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-base text-ink tracking-tight group-hover:text-accent transition-colors">
                FarmGate Hub
              </span>
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted hidden sm:block">
              Peri-Urban Micro-Hub Suite
            </span>
          </div>
        </Link>

        {/* Primary Navigation Links with Clear Active Highlighting */}
        <nav
          aria-label="Suite module navigation"
          className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              aria-current={item.isActive ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-[13px] transition-all flex items-center gap-1.5 shrink-0 ${
                item.isActive
                  ? 'bg-accent text-white font-bold shadow-xs border border-accent ring-2 ring-accent/20'
                  : item.isMono
                  ? 'font-mono text-[11px] text-ink-muted hover:text-ink hover:bg-surface border border-transparent hover:border-border'
                  : 'font-medium text-ink-muted hover:text-ink hover:bg-surface border border-transparent hover:border-border'
              }`}
            >
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
              )}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <DemoProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-page text-ink">
              {/* Monorepo Top Navigation Bar */}
              <TopNav />

              {/* Main Content Area */}
              <main className="flex-1">
                <Routes>
                  <Route path="/farmer/*" element={<FarmerLayout />} />
                  <Route path="/hub/*" element={<HubLayout />} />
                  <Route path="/buyer/*" element={<BuyerPortal />} />
                  <Route path="/t/:code" element={<TraceabilityPage />} />
                  <Route path="/t" element={<TraceabilityPage />} />
                  <Route path="/channels/*" element={<ChannelsSimulator />} />
                  <Route path="/impact/*" element={<ImpactLayout />} />
                  <Route path="/sources/*" element={<SourcesPage />} />
                  <Route path="/styleguide" element={<StyleguidePage />} />
                  <Route path="/" element={<Navigate to="/farmer" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </DemoProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};
