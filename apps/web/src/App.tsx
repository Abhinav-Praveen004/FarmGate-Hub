import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext.js';
import { DemoProvider } from './context/DemoContext.js';
import { FarmerLayout } from './surfaces/farmer/FarmerLayout.js';
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
              {/* Monorepo Top Navigation Bar (for easy reviewer switching) */}
              <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <Link to="/farmer" className="font-serif font-bold text-sm tracking-tight text-ink hover:text-accent">
                    FarmGate Hub
                  </Link>
                  <span className="text-ink-muted hidden md:inline">| Demo Prototype</span>
                </div>

                <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none">
                  <Link
                    to="/farmer"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Farmer App (P0)
                  </Link>
                  <Link
                    to="/hub"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Hub Console (P0)
                  </Link>
                  <Link
                    to="/impact"
                    className="px-2.5 py-1 rounded font-medium text-ink hover:bg-surface border border-transparent hover:border-border"
                  >
                    Impact & Pitch (P0)
                  </Link>
                  <Link
                    to="/styleguide"
                    className="px-2 py-1 rounded text-ink-muted hover:text-ink font-mono text-[11px]"
                  >
                    Styleguide
                  </Link>
                </nav>
              </header>

              {/* Main Content Area */}
              <main className="flex-1">
                <Routes>
                  <Route path="/farmer/*" element={<FarmerLayout />} />
                  <Route path="/styleguide" element={<StyleguidePage />} />
                  <Route
                    path="/hub/*"
                    element={
                      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
                        <h2 className="text-xl font-serif font-bold">Hub Operator Console</h2>
                        <p className="text-sm text-ink-muted">Milestone 5 implements intake, scale capture, cool pod telemetry, and payouts.</p>
                        <Link to="/farmer" className="text-accent underline font-semibold text-sm">
                          Return to Farmer App
                        </Link>
                      </div>
                    }
                  />
                  <Route
                    path="/impact/*"
                    element={
                      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
                        <h2 className="text-xl font-serif font-bold">Impact & Investor Dashboard</h2>
                        <p className="text-sm text-ink-muted">Milestone 5 implements 5 KPI scorecards, cohort network model, and sensitivity engine.</p>
                        <Link to="/farmer" className="text-accent underline font-semibold text-sm">
                          Return to Farmer App
                        </Link>
                      </div>
                    }
                  />
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
