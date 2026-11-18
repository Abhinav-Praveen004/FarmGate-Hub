import React, { useState, useEffect } from 'react';
import { PodGauge, Badge, Button } from '@farmgate/ui';
import { useFarmerLots } from '../../api/client';
import {
  Thermometer,
  Zap,
  Sun,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { formatWeightKg } from '@farmgate/shared';

export const CoolPodBoard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<any>({
    capacityKg: 10000,
    currentOccupancyKg: 6840,
    occupancyPercentage: 68.4,
    temperatureCelsius: 11.5,
    setpointCelsius: 11.5,
    humidityPercent: 88,
    solarOutputWatts: 3850,
    thermalBackupPercent: 92,
    gridActive: true,
    doorOpen: false,
    status: 'optimal',
  });

  const [activeFault, setActiveFault] = useState<string>('normal');
  const [isUpdatingFault, setIsUpdatingFault] = useState(false);
  const { data: lots, refetch: refetchLots } = useFarmerLots();

  // Filter lots currently in pod
  const podLots = lots?.filter((l) => l.status === 'IN_POD') || [];

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/hub/pod/telemetry');
      const data = await res.json();
      if (data) setTelemetry(data);
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerFault = async (fault: 'power_cut' | 'door_open' | 'normal') => {
    setIsUpdatingFault(true);
    try {
      await fetch('/api/hub/pod/fault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fault }),
      });
      setActiveFault(fault);
      await fetchTelemetry();
    } catch (err) {
      console.error('Fault simulation error:', err);
    } finally {
      setIsUpdatingFault(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Operator Console: Micro-Cold Storage</span>
          <h1 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            10-Tonne Solar Cool Pod Telemetry
            <Badge variant="simulated">IOT SENSOR FEED</Badge>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              telemetry.doorOpen
                ? 'grade_c'
                : !telemetry.gridActive
                ? 'warning'
                : 'success'
            }
          >
            {telemetry.doorOpen ? 'DOOR OPEN ALERT' : !telemetry.gridActive ? 'THERMAL BACKUP RUNNING' : 'OPTIMAL 11.5°C'}
          </Badge>
        </div>
      </div>

      {/* Main Signature PodGauge Component */}
      <PodGauge
        telemetry={{
          capacityKg: telemetry.capacityKg || 10000,
          currentOccupancyKg: telemetry.currentOccupancyKg || 6840,
          temperatureCelsius: telemetry.temperatureCelsius || 11.5,
          setpointCelsius: telemetry.setpointCelsius || 11.5,
          humidityPercent: telemetry.humidityPercent || 88,
          solarOutputWatts: telemetry.solarOutputWatts || 3850,
          thermalBackupPercent: telemetry.thermalBackupPercent || 92,
          gridActive: telemetry.gridActive ?? true,
          doorOpen: telemetry.doorOpen ?? false,
          simulated: true,
          lastUpdated: new Date().toISOString(),
        }}
        onSimulatePowerCut={() => triggerFault('power_cut')}
        onSimulateDoorOpen={() => triggerFault('door_open')}
        onRestoreGrid={() => triggerFault('normal')}
      />

      {/* Active Lots Stored Inside the Cool Pod */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            <h2 className="text-base font-bold text-ink">Active Lots Stored in Cool Pod ({podLots.length} Lots)</h2>
          </div>
          <span className="text-xs font-mono text-ink-muted">Max Shelf-Life: 72 Hours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-ink-muted font-mono uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Lot</th>
                <th className="py-2.5 px-3">Farmer</th>
                <th className="py-2.5 px-3">Crop / Variety</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">In Pod</th>
                <th className="py-2.5 px-3">Remaining Window</th>
                <th className="py-2.5 px-3">Match Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Lot #214 Spotlight Row */}
              <tr className="bg-accent/5 hover:bg-accent/10 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-accent">Lot #214</td>
                <td className="py-3 px-3 font-medium text-ink">Ramesh Chandra</td>
                <td className="py-3 px-3 text-ink-muted">Hybrid Tomato</td>
                <td className="py-3 px-3 font-mono font-bold text-ink">120 kg</td>
                <td className="py-3 px-3">
                  <Badge variant="grade_a">Grade A</Badge>
                </td>
                <td className="py-3 px-3 font-mono text-ink font-semibold">14 hours</td>
                <td className="py-3 px-3">
                  <div className="w-32 bg-border/40 h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: '80%' }} />
                  </div>
                  <span className="text-[10px] text-ink-muted mt-0.5 block font-mono">58h remaining</span>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-accent font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>78% Fit (Annapurna)</span>
                  </span>
                </td>
              </tr>

              {/* Sample other pod lots */}
              <tr className="hover:bg-surface transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-ink">Lot #212</td>
                <td className="py-3 px-3 font-medium text-ink">Murugan K.</td>
                <td className="py-3 px-3 text-ink-muted">Hybrid Tomato</td>
                <td className="py-3 px-3 font-mono font-bold text-ink">240 kg</td>
                <td className="py-3 px-3">
                  <Badge variant="grade_a">Grade A</Badge>
                </td>
                <td className="py-3 px-3 font-mono text-ink font-semibold">22 hours</td>
                <td className="py-3 px-3">
                  <div className="w-32 bg-border/40 h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: '69%' }} />
                  </div>
                  <span className="text-[10px] text-ink-muted mt-0.5 block font-mono">50h remaining</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-ink-muted font-mono">82% Fit (Annapurna)</span>
                </td>
              </tr>

              <tr className="hover:bg-surface transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-ink">Lot #211</td>
                <td className="py-3 px-3 font-medium text-ink">Lakshmi Devi</td>
                <td className="py-3 px-3 text-ink-muted">Hybrid Tomato</td>
                <td className="py-3 px-3 font-mono font-bold text-ink">140 kg</td>
                <td className="py-3 px-3">
                  <Badge variant="grade_b">Grade B</Badge>
                </td>
                <td className="py-3 px-3 font-mono text-ink font-semibold">28 hours</td>
                <td className="py-3 px-3">
                  <div className="w-32 bg-border/40 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '61%' }} />
                  </div>
                  <span className="text-[10px] text-ink-muted mt-0.5 block font-mono">44h remaining</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-ink-muted font-mono">75% Fit (FreshBasket)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
