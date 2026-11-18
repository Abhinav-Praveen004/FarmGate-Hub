import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <DemoProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-page text-ink">
              {/* Monorepo Top Navigation Bar */}
              <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <Link to="/farmer" className="font-serif font-bold text-sm tracking-tight text-ink hover:text-accent">
                    FarmGate Hub
                  </Link>
                  <span className="text-ink-muted hidden lg:inline">| Demo Suite</span>
                </div>

                <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none">
                  <Link
                    to="/farmer"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Farmer App
                  </Link>
                  <Link
                    to="/hub"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Hub Console
                  </Link>
                  <Link
                    to="/buyer"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Buyer Portal
                  </Link>
                  <Link
                    to="/t/FGH-ANNUR-2026-LOT214"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    QR Traceability
                  </Link>
                  <Link
                    to="/channels"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Channels / IVR
                  </Link>
                  <Link
                    to="/impact"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Impact Dashboard
                  </Link>
                  <Link
                    to="/sources"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Sources
                  </Link>
                  <Link
                    to="/styleguide"
                    className="px-2 py-1 rounded text-ink-muted hover:text-ink font-mono text-[11px]"
                  >
                    Tokens
                  </Link>
                </nav>
              </header>

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
