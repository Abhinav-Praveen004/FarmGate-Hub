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
  Sparkles,
} from 'lucide-react';
import { formatWeightKg } from '@farmgate/shared';

const FARMER_NAMES: Record<string, string> = {
  farmer_meena: 'Ramesh Chandra',
  'FARMER-001': 'Ramesh Chandra',
  farmer_ramesh: 'Ramesh Chandra',
  farmer_murugan: 'Murugan K.',
  'FARMER-002': 'Murugan K.',
  farmer_lakshmi: 'Lakshmi Devi',
  'FARMER-003': 'Lakshmi Devi',
  farmer_suresh: 'Suresh Gowda',
  'FARMER-004': 'Suresh Gowda',
  farmer_arun: 'Arun Kumar',
  farmer_deepa: 'Deepa M.',
  farmer_anand: 'Anand V.',
  farmer_kavita: 'Kavita Devi',
  farmer_rajesh: 'Rajesh G.',
  farmer_geetha: 'Geetha R.',
  farmer_selvam: 'Selvam P.',
};

const DEFAULT_POD_LOTS = [
  { id: 'lot_214', lotNumber: 214, farmerName: 'Ramesh Chandra', crop: 'Hybrid Tomato', weightKg: 120, grade: 'A', podHours: 14, matchScore: 78, matchBuyer: 'Annapurna' },
  { id: 'lot_212', lotNumber: 212, farmerName: 'Murugan K.', crop: 'Hybrid Tomato', weightKg: 240, grade: 'A', podHours: 22, matchScore: 82, matchBuyer: 'Annapurna' },
  { id: 'lot_211', lotNumber: 211, farmerName: 'Lakshmi Devi', crop: 'Hybrid Tomato', weightKg: 140, grade: 'B', podHours: 28, matchScore: 75, matchBuyer: 'FreshBasket' },
];

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
    refetchLots();
    const interval = setInterval(() => {
      fetchTelemetry();
      refetchLots();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerFault = async (fault: 'power_cut' | 'door_open' | 'normal') => {
    setIsUpdatingFault(true);
    try {
      const res = await fetch('/api/hub/pod/fault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fault }),
      });
      const data = await res.json();
      if (data.telemetry) {
        setTelemetry(data.telemetry);
      }
      setActiveFault(fault);
      await fetchTelemetry();
    } catch (err) {
      console.error('Fault simulation error:', err);
    } finally {
      setIsUpdatingFault(false);
    }
  };

  // Map live lots in pod from SQLite database
  const livePodLots =
    lots && lots.length > 0
      ? lots
          .filter((l) => (l.status || '').toUpperCase() === 'IN_POD')
          .map((l) => {
            const weightKg = Math.round((l.weightGrams / 1000) * 10) / 10;
            const farmerName = FARMER_NAMES[l.farmerId] || 'Smallholder Farmer';
            const isNewlyIntake = l.lotNumber > 214;
            const podHours = isNewlyIntake ? 1 : l.lotNumber === 214 ? 14 : l.lotNumber === 212 ? 22 : 28;
            const remainingHours = Math.max(0, 72 - podHours);
            const grade = (l.grade || 'A').toUpperCase();
            const matchBuyer = grade === 'A' ? 'Annapurna Kirana' : 'FreshBasket';
            const matchScore = grade === 'A' ? 78 : 74;
            return {
              id: l.id,
              lotNumber: l.lotNumber,
              farmerName,
              crop: 'Hybrid Tomato',
              weightKg,
              grade,
              podHours,
              remainingHours,
              matchBuyer,
              matchScore,
              isNewlyIntake,
            };
          })
      : DEFAULT_POD_LOTS.map((d) => ({
          ...d,
          remainingHours: 72 - d.podHours,
          isNewlyIntake: false,
        }));

  // Dynamic Occupancy based on real lots in pod
  const calculatedOccupancyKg = 6200 + livePodLots.reduce((sum, l) => sum + l.weightKg, 0);

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
          currentOccupancyKg: calculatedOccupancyKg,
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
            <h2 className="text-base font-bold text-ink">Active Lots Stored in Cool Pod ({livePodLots.length} Lots)</h2>
          </div>
          <span className="text-xs font-mono text-ink-muted">Max Shelf-Life: 72 Hours • Pre-cooled @ 11.5°C</span>
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
              {livePodLots.map((lot) => {
                const percentRemaining = Math.round((lot.remainingHours / 72) * 100);
                return (
                  <tr
                    key={lot.id}
                    className={`transition-colors ${
                      lot.isNewlyIntake
                        ? 'bg-emerald-50/70 hover:bg-emerald-100/60'
                        : lot.lotNumber === 214
                        ? 'bg-accent/5 hover:bg-accent/10'
                        : 'hover:bg-surface'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-accent">
                      <div className="flex items-center gap-1.5">
                        <span>Lot #{lot.lotNumber}</span>
                        {lot.isNewlyIntake && (
                          <Badge variant="success" size="sm">
                            NEW INTAKE
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-ink">{lot.farmerName}</td>
                    <td className="py-3 px-3 text-ink-muted">{lot.crop}</td>
                    <td className="py-3 px-3 font-mono font-bold text-ink">{lot.weightKg} kg</td>
                    <td className="py-3 px-3">
                      <Badge variant={lot.grade === 'A' ? 'grade_a' : lot.grade === 'B' ? 'grade_b' : 'grade_c'}>
                        Grade {lot.grade}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-ink font-semibold">{lot.podHours} hours</td>
                    <td className="py-3 px-3">
                      <div className="w-32 bg-border/40 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentRemaining > 50 ? 'bg-accent' : percentRemaining > 20 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentRemaining}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-ink-muted mt-0.5 block font-mono">
                        {lot.remainingHours}h remaining
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-accent font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {lot.matchScore}% Fit ({lot.matchBuyer})
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
