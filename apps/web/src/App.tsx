import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { StyleguidePage } from './pages/Styleguide.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-page text-ink">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <Link to="/styleguide" className="font-bold text-sm tracking-tight hover:text-accent">
              FarmGate Hub
            </Link>
            <span className="text-ink-muted hidden sm:inline">| Prototype</span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/styleguide"
              className="px-2.5 py-1.5 rounded font-medium text-ink hover:bg-surface"
            >
              Styleguide (M3)
            </Link>
            <Link
              to="/farmer"
              className="px-2.5 py-1.5 rounded font-medium text-ink hover:bg-surface"
            >
              Farmer (M4)
            </Link>
            <Link
              to="/hub"
              className="px-2.5 py-1.5 rounded font-medium text-ink hover:bg-surface"
            >
              Hub Console (M5)
            </Link>
            <Link
              to="/impact"
              className="px-2.5 py-1.5 rounded font-medium text-ink hover:bg-surface"
            >
              Impact (M5)
            </Link>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/styleguide" element={<StyleguidePage />} />
            <Route
              path="/farmer"
              element={
                <div className="max-w-md mx-auto p-8 text-center space-y-4">
                  <h2 className="text-xl font-bold">Farmer App Surface</h2>
                  <p className="text-sm text-ink-muted">Milestone 4 is ready to implement this mobile-first surface.</p>
                  <Link to="/styleguide" className="text-accent underline font-semibold text-sm">
                    View Styleguide Components
                  </Link>
                </div>
              }
            />
            <Route
              path="/hub"
              element={
                <div className="max-w-xl mx-auto p-8 text-center space-y-4">
                  <h2 className="text-xl font-bold">Hub Console Surface</h2>
                  <p className="text-sm text-ink-muted">Milestone 5 is ready to implement this operator surface.</p>
                  <Link to="/styleguide" className="text-accent underline font-semibold text-sm">
                    View Styleguide Components
                  </Link>
                </div>
              }
            />
            <Route
              path="/impact"
              element={
                <div className="max-w-xl mx-auto p-8 text-center space-y-4">
                  <h2 className="text-xl font-bold">Impact & Investor Dashboard</h2>
                  <p className="text-sm text-ink-muted">Milestone 5 is ready to implement this dashboard.</p>
                  <Link to="/styleguide" className="text-accent underline font-semibold text-sm">
                    View Styleguide Components
                  </Link>
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/styleguide" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};
