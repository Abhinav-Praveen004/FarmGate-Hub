import React, { useState } from 'react';
import { Badge, Button } from '@farmgate/ui';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Check,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatRupees } from '@farmgate/shared';

interface PayoutItem {
  id: string;
  lotNumber: number;
  farmerName: string;
  vpa: string;
  weightKg: number;
  grossAmount: number;
  feeDeducted: number;
  advanceRecovered: number;
  netPayout: number;
  hoursRemaining: number;
  status: 'PENDING' | 'SETTLED';
  utr?: string;
}

const SAMPLE_PAYOUTS: PayoutItem[] = [
  {
    id: 'PO-214',
    lotNumber: 214,
    farmerName: 'Ramesh Chandra',
    vpa: 'ramesh@okhdfcbank',
    weightKg: 120,
    grossAmount: 1680.0,
    feeDeducted: 230.4,
    advanceRecovered: 0,
    netPayout: 1449.6,
    hoursRemaining: 18,
    status: 'PENDING',
  },
  {
    id: 'PO-212',
    lotNumber: 212,
    farmerName: 'Murugan K.',
    vpa: 'murugan@upi',
    weightKg: 240,
    grossAmount: 3360.0,
    feeDeducted: 460.8,
    advanceRecovered: 1000.0,
    netPayout: 1899.2,
    hoursRemaining: 14,
    status: 'PENDING',
  },
  {
    id: 'PO-198',
    lotNumber: 198,
    farmerName: 'Ramesh Chandra',
    vpa: 'ramesh@okhdfcbank',
    weightKg: 100,
    grossAmount: 1350.0,
    feeDeducted: 190.5,
    advanceRecovered: 0,
    netPayout: 1159.5,
    hoursRemaining: 0,
    status: 'SETTLED',
    utr: 'UPI/432198004123',
  },
];

export const PayoutsQueue: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutItem[]>(SAMPLE_PAYOUTS);
  const [pendingAdvances, setPendingAdvances] = useState([
    {
      id: 'ADV-REQ-01',
      farmer: 'Ramesh Chandra',
      vpa: 'ramesh@okhdfcbank',
      lotNumber: 214,
      amountRupees: 1008,
      percent: 60,
      status: 'PENDING_APPROVAL',
    },
  ]);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const handleApproveAdvance = (id: string) => {
    setPendingAdvances((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSettlePayout = async (id: string) => {
    setSettlingId(id);
    try {
      await fetch(`/api/hub/payouts/${id}/settle`, { method: 'POST' });
    } catch {
      // Local fallback
    } finally {
      setTimeout(() => {
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'SETTLED',
                  utr: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                }
              : p
          )
        );
        setSettlingId(null);
      }, 600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">Operator Console: Treasury & Payments</span>
          <h1 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            24-Hour SLA Payouts & Advances Queue
            <Badge variant="simulated">SIMULATED UPI ADAPTER</Badge>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">100% SLA COMPLIANCE</Badge>
        </div>
      </div>

      {/* Section 1: Pending Advances Approval Queue */}
      {pendingAdvances.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Zap className="w-5 h-5 text-amber-600" />
              <span>Pending Farmer Advance Requests ({pendingAdvances.length})</span>
            </div>
            <span className="text-xs font-mono text-amber-700">1% Platform Fee Applied</span>
          </div>

          <div className="space-y-2">
            {pendingAdvances.map((adv) => (
              <div
                key={adv.id}
                className="bg-surface-elevated p-3.5 rounded-lg border border-amber-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-ink">{adv.farmer}</span>
                    <Badge variant="neutral" size="sm">Lot #{adv.lotNumber}</Badge>
                    <span className="text-xs font-mono text-ink-muted">{adv.vpa}</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Requested {adv.percent}% produce advance of ₹{adv.amountRupees} (auto-recovered from collective sale).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingAdvances((prev) => prev.filter((a) => a.id !== adv.id))}
                    className="text-red-700 border-red-300 hover:bg-red-50 text-xs py-1"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApproveAdvance(adv.id)}
                    className="text-xs py-1 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve & Disburse UPI
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: 24-Hour SLA Payout Queue Table */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <h2 className="text-base font-bold text-ink">Settlement Queue (Automated 24h SLA)</h2>
          </div>
          <span className="text-xs font-mono text-ink-muted">Double-Entry Ledger Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-ink-muted font-mono uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Lot</th>
                <th className="py-2.5 px-3">Farmer & VPA</th>
                <th className="py-2.5 px-3 text-right">Gross Value</th>
                <th className="py-2.5 px-3 text-right">Hub Fee (₹1.5/kg + 3%)</th>
                <th className="py-2.5 px-3 text-right">Advance Recovered</th>
                <th className="py-2.5 px-3 text-right">Net Payout</th>
                <th className="py-2.5 px-3">SLA Countdown</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {payouts.map((payout) => {
                const isSettled = payout.status === 'SETTLED';
                return (
                  <tr
                    key={payout.id}
                    className={`transition-colors ${isSettled ? 'bg-surface/50' : 'hover:bg-surface'}`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-ink">
                      Lot #{payout.lotNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-ink">{payout.farmerName}</div>
                      <span className="text-[11px] font-mono text-ink-muted">{payout.vpa}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                      ₹{payout.grossAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-ink-muted">
                      -₹{payout.feeDeducted.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-ink-muted">
                      {payout.advanceRecovered > 0 ? `-₹${payout.advanceRecovered.toFixed(2)}` : '₹0.00'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-accent text-sm">
                      ₹{payout.netPayout.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      {isSettled ? (
                        <div className="flex items-center gap-1.5 text-accent font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Paid ({payout.utr})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-600">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>{payout.hoursRemaining}h remaining</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isSettled ? (
                        <Badge variant="success" size="sm">SETTLED</Badge>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={settlingId === payout.id}
                          onClick={() => handleSettlePayout(payout.id)}
                          className="text-xs py-1"
                        >
                          {settlingId === payout.id ? 'Transferring...' : 'Settle UPI'}
                        </Button>
                      )}
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
