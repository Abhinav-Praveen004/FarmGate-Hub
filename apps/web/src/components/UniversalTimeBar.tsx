import React from 'react';
import { useDemo } from '../context/DemoContext.js';
import { Radio, RotateCcw, Clock, Zap, FastForward } from 'lucide-react';
import { Badge } from '@farmgate/ui';

export const UniversalTimeBar: React.FC = () => {
  const {
    clockTime,
    timeMode,
    setTimeMode,
    advanceClock,
    resetDemo,
    isSSEConnected,
    isWarping,
  } = useDemo();

  return (
    <div
      role="region"
      aria-label="Global Dynamic Time System & Simulation Controls"
      className="w-full bg-surface-elevated/95 backdrop-blur-md border-b border-border py-2 px-4 sm:px-6 shadow-2xs sticky top-14 z-40 transition-colors"
    >
      <div className="max-w-[1500px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Dynamic Live Clock with Seconds & Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio
              className={`w-3.5 h-3.5 shrink-0 ${
                isSSEConnected ? 'text-accent animate-pulse' : 'text-amber-500'
              }`}
            />
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="font-bold text-ink text-xs sm:text-[13px] tracking-tight">
                {clockTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span className="text-ink-muted text-[11px] hidden md:inline">
                • {clockTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-ink-muted text-[11px] md:hidden">
                • {clockTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Time Mode Toggle: Real Clock vs Simulation Warp */}
          <div className="flex items-center bg-surface p-0.5 rounded-lg border border-border text-[11px]">
            <button
              type="button"
              onClick={() => setTimeMode('actual')}
              className={`px-2 py-0.5 rounded-md font-medium flex items-center gap-1 transition-all cursor-pointer ${
                timeMode === 'actual'
                  ? 'bg-accent text-white font-bold shadow-2xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Use actual local device clock in real time"
            >
              <Zap className="w-3 h-3" />
              <span>Real Live Time</span>
            </button>

            <button
              type="button"
              onClick={() => setTimeMode('simulated')}
              className={`px-2 py-0.5 rounded-md font-medium flex items-center gap-1 transition-all cursor-pointer ${
                timeMode === 'simulated'
                  ? 'bg-accent text-white font-bold shadow-2xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Use simulation epoch with Time Warp controls"
            >
              <FastForward className="w-3 h-3" />
              <span>Sim Warp</span>
            </button>
          </div>
        </div>

        {/* Right: Time Warp Controls */}
        <div className="flex items-center gap-2">
          {isWarping ? (
            <span className="text-accent font-mono text-[11px] flex items-center gap-1.5 animate-pulse">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Advancing timeline...</span>
            </span>
          ) : (
            <>
              <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted hidden lg:inline">
                TIME WARP:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => advanceClock(1)}
                  disabled={isWarping}
                  className="px-2 py-1 rounded bg-surface hover:bg-surface-elevated text-ink font-mono text-[11px] border border-border hover:border-accent transition-colors cursor-pointer"
                  title="Advance 1 hour"
                >
                  +1h
                </button>
                <button
                  type="button"
                  onClick={() => advanceClock(6)}
                  disabled={isWarping}
                  className="px-2 py-1 rounded bg-surface hover:bg-surface-elevated text-ink font-mono text-[11px] border border-border hover:border-accent transition-colors cursor-pointer"
                  title="Advance 6 hours"
                >
                  +6h
                </button>
                <button
                  type="button"
                  onClick={() => advanceClock(14)}
                  disabled={isWarping}
                  className="px-2 py-1 rounded bg-accent/10 hover:bg-accent/20 text-accent font-mono text-[11px] font-bold border border-accent/40 hover:border-accent transition-colors cursor-pointer"
                  title="Advance 14 hours (trigger wholesale match)"
                >
                  +14h
                </button>
                <button
                  type="button"
                  onClick={() => advanceClock(24)}
                  disabled={isWarping}
                  className="px-2 py-1 rounded bg-surface hover:bg-surface-elevated text-ink font-mono text-[11px] border border-border hover:border-accent transition-colors cursor-pointer"
                  title="Advance 24 hours"
                >
                  +24h
                </button>
                <button
                  type="button"
                  onClick={() => resetDemo()}
                  disabled={isWarping}
                  title="Reset demo clock & database to initial seed state"
                  aria-label="Reset demo clock & database to initial seed state"
                  className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink border border-border hover:border-accent transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
