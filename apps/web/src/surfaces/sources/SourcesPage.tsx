import React from 'react';
import { Badge } from '@farmgate/ui';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileText,
  Info,
  Award,
} from 'lucide-react';
import {
  PROBLEM_EVIDENCE,
  EvidenceRecord,
  TEAM_CREDITS,
  ASSUMPTION_TEST,
  IDEA_SCORING,
} from '@farmgate/shared';

export const SourcesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-ink pb-16">
      {/* Sub-header Banner */}
      <div className="bg-surface-elevated border-b border-border py-3 px-4 sm:px-6 shadow-sm sticky top-12 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <h1 className="font-serif font-bold text-base text-ink">Evidence Base & Research Sources</h1>
              <Badge variant="success">SECTION 4 VERIFIED</Badge>
            </div>
            <span className="text-ink-muted hidden md:inline">| Academic Origin: Group 4 Report</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-ink-muted">
            <span>Zero Unreported Assumptions</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Attribution Card */}
        <div className="bg-surface-elevated border-2 border-accent/30 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-accent font-bold text-sm">
            <Award className="w-5 h-5 text-accent" />
            <span>Academic Authors & Original Field Research</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            This prototype is based on the course report <em>&quot;Improving Farmers&apos; Income&quot;</em> authored by Group 4:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {TEAM_CREDITS.names.map((author: string) => (
              <span
                key={author}
                className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs font-semibold text-accent"
              >
                {author}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Items Table */}
        <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span>Evidence Master Register ({PROBLEM_EVIDENCE.length} Key Parameters)</span>
            </h3>
            <span className="text-xs font-mono text-ink-muted">packages/shared/src/evidence</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-ink-muted font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Indicator</th>
                  <th className="py-2.5 px-3">Evidence Cited in Report</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Source Citation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {PROBLEM_EVIDENCE.map((item: EvidenceRecord) => (
                  <tr key={item.id} className="hover:bg-surface transition-colors">
                    <td className="py-3 px-3 font-medium text-ink">
                      {item.indicator}
                    </td>
                    <td className="py-3 px-3 font-mono text-ink font-semibold max-w-sm">
                      {item.evidence}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          item.status === 'reported'
                            ? 'success'
                            : item.status === 'calculated'
                            ? 'accent'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-ink-muted leading-relaxed max-w-xs">
                      {item.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assumption Test Section */}
        <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-ink">Core Assumption Test (Report Section 4.3)</h3>
          <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
            <div className="font-bold text-ink text-sm">
              Claim: &quot;{ASSUMPTION_TEST[0].claim}&quot;
            </div>
            <div className="text-accent font-semibold">
              Verdict: {ASSUMPTION_TEST[0].verdict}
            </div>
            <ul className="list-disc pl-4 space-y-1 text-ink-muted pt-2">
              {ASSUMPTION_TEST[0].reasons.map((r, i) => (
                <li key={i}>
                  <strong>{r.fact}:</strong> {r.insight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Idea Matrix Section */}
        <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-ink">Idea Evaluation Matrix (Section 4.4)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {IDEA_SCORING.map((idea) => (
              <div
                key={idea.name}
                className={`p-3 rounded-xl border ${
                  idea.chosen
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'bg-surface border-border text-ink'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span>{idea.name}</span>
                  <span className="font-mono text-sm">{idea.score} / 40</span>
                </div>
                <span className="text-[11px] block mt-1">
                  {idea.chosen ? '✓ Selected Solution' : 'Rejected alternative'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
