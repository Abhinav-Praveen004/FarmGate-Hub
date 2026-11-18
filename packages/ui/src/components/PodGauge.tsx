import React from 'react';
import { Sun, BatteryCharging, Thermometer, Droplets, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { PodTelemetry } from '@farmgate/shared';

export interface PodGaugeProps {
  telemetry: PodTelemetry;
  onSimulatePowerCut?: () => void;
  onSimulateDoorOpen?: () => void;
  onRestoreGrid?: () => void;
  className?: string;
}

export const PodGauge: React.FC<PodGaugeProps> = ({
  telemetry,
  onSimulatePowerCut,
  onSimulateDoorOpen,
  onRestoreGrid,
  className = '',
}) => {
  const occupancyPercent = Math.round((telemetry.currentOccupancyKg / telemetry.capacityKg) * 100);
  const isTempOptimal = telemetry.temperatureCelsius >= 10.0 && telemetry.temperatureCelsius <= 13.0;

  return (
    <div className={`bg-surface-elevated border border-border rounded-lg p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-ink">Solar Cool Pod Telemetry</h3>
            <Badge variant="simulated">Simulated</Badge>
          </div>
          <p className="text-xs text-ink-muted">10-Tonne farm-gate cool storage with phase-change thermal backup</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-ink-muted">Target: 11.5°C ± 1.5°C</div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* 1. Temperature */}
        <div className={`p-3 rounded-md border ${isTempOptimal ? 'bg-sky-50 border-sky-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold">Temperature</span>
            <Thermometer className={`w-4 h-4 ${isTempOptimal ? 'text-sky-600' : 'text-red-600'}`} />
          </div>
          <div className="text-2xl font-black text-ink mt-1 tabular-nums">
            {telemetry.temperatureCelsius.toFixed(1)}°C
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            {isTempOptimal ? 'Optimal 10°–13°C band' : 'Temperature excursion!'}
          </div>
        </div>

        {/* 2. Humidity */}
        <div className="bg-surface p-3 rounded-md border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold">Relative Humidity</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-ink mt-1 tabular-nums">
            {telemetry.humidityPercent}%
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">RH Target: 85–90%</div>
        </div>

        {/* 3. Solar Generation */}
        <div className="bg-surface p-3 rounded-md border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold">Solar Array</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-ink mt-1 tabular-nums">
            {telemetry.solarOutputWatts} W
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            {telemetry.gridActive ? 'Rooftop solar active' : 'Solar reduced'}
          </div>
        </div>

        {/* 4. Thermal Backup */}
        <div className="bg-surface p-3 rounded-md border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold">Thermal Reserve</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-ink mt-1 tabular-nums">
            {telemetry.thermalBackupPercent}%
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">8h backup reserve</div>
        </div>
      </div>

      {/* Pod Occupancy Bar (10,000 kg capacity) */}
      <div className="mb-5 bg-surface/60 p-3 rounded-md border border-border-subtle">
        <div className="flex justify-between items-center text-xs font-semibold text-ink mb-1.5">
          <span>Pod Occupancy: {telemetry.currentOccupancyKg.toLocaleString()} kg / {telemetry.capacityKg.toLocaleString()} kg</span>
          <span className="tabular-nums">{occupancyPercent}% Utilised</span>
        </div>
        <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 rounded-full"
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
      </div>

      {/* Hardware Simulation Controls */}
      <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-ink-muted font-medium">Fault Simulator:</span>
          {telemetry.gridActive ? (
            <button
              type="button"
              onClick={onSimulatePowerCut}
              className="text-amber-800 hover:text-amber-900 underline font-medium"
            >
              Simulate Power Outage
            </button>
          ) : (
            <button
              type="button"
              onClick={onRestoreGrid}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline"
            >
              Restore Grid Power
            </button>
          )}

          <button
            type="button"
            onClick={onSimulateDoorOpen}
            className="text-stone-700 hover:text-stone-900 underline font-medium"
          >
            {telemetry.doorOpen ? 'Close Pod Door' : 'Simulate Open Door'}
          </button>
        </div>

        <div className="text-[11px] text-ink-muted font-mono">
          State: {telemetry.gridActive ? 'Grid Normal' : 'Running on Thermal Backup'} | Door: {telemetry.doorOpen ? 'OPEN' : 'LATCHED'}
        </div>
      </div>
    </div>
  );
};
