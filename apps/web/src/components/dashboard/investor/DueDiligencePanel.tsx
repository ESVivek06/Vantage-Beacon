'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchScoreDonut } from '@/components/MatchScoreDonut';
import { cn } from '@/lib/utils';

export interface DueDiligenceStartup {
  id: string;
  displayName: string;
  founderName: string;
}

export interface DueDiligenceData {
  matchScore: number;
  matchReasons: string[];
  checklist: {
    emailVerified: boolean;
    linkedInConnected: boolean;
    profileComplete: boolean;
    startupDeclared: boolean;
    companiesHouseVerified: boolean;
    pitchDeckShared: boolean;
    financialsShared: boolean;
    referencesProvided: boolean;
  };
  consentedFields: string[];
  visibleData: {
    name?: string;
    startup?: string;
    sector?: string;
    stage?: string;
    raising?: string;
    traction?: string;
  };
}

function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-neutral-100 last:border-0">
      {checked ? (
        <CheckCircle2 className="h-4 w-4 text-success-600 shrink-0" aria-hidden="true" />
      ) : (
        <Circle className="h-4 w-4 text-neutral-300 shrink-0" aria-hidden="true" />
      )}
      <span className={cn('text-sm', checked ? 'text-neutral-700' : 'text-neutral-400')}>
        {label}
      </span>
    </div>
  );
}

function DataRow({ label, value, consented }: { label: string; value?: string; consented: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
      <dt className="text-xs text-neutral-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium">
        {consented && value ? (
          <span className="text-neutral-900">{value}</span>
        ) : (
          <span className="text-neutral-300 flex items-center gap-1">
            —
            <Lock
              className="h-3 w-3 text-neutral-300"
              aria-label="Data not shared by founder"
            />
          </span>
        )}
      </dd>
    </div>
  );
}

function ConsentStatus({ label, consented }: { label: string; consented: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {consented ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-success-600 shrink-0" aria-hidden="true" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-neutral-300 shrink-0" aria-hidden="true" />
      )}
      <span className={cn('text-xs', consented ? 'text-neutral-700' : 'text-neutral-400')}>
        {label}
      </span>
    </div>
  );
}

interface DueDiligencePanelProps {
  portfolio: DueDiligenceStartup[];
  onLoadData: (startupId: string) => Promise<DueDiligenceData>;
  onRequestAccess: (startupId: string) => void;
}

export function DueDiligencePanel({ portfolio, onLoadData, onRequestAccess }: DueDiligencePanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState<DueDiligenceData | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSelect(id: string) {
    setSelectedId(id);
    setData(null);
    setLoading(true);
    try {
      const result = await onLoadData(id);
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  if (portfolio.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
        <p className="text-sm text-neutral-500">No startups in your portfolio yet.</p>
        <p className="text-xs text-neutral-400 mt-1">Express interest in deal flow to add startups.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Startup picker */}
      <div>
        <label htmlFor="dd-startup-picker" className="text-sm font-medium text-neutral-700 block mb-1.5">
          Select startup
        </label>
        <select
          id="dd-startup-picker"
          value={selectedId ?? ''}
          onChange={(e) => e.target.value && handleSelect(e.target.value)}
          className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[280px]"
        >
          <option value="">Select a startup…</option>
          {portfolio.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName} ({s.founderName})
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-5 animate-pulse space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 bg-neutral-100 rounded" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Data panels */}
      {!loading && data && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Left: Checklist + consented data */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
                Identity & trust
              </h3>
              <ChecklistItem checked={data.checklist.emailVerified} label="Email verified" />
              <ChecklistItem checked={data.checklist.linkedInConnected} label="LinkedIn connected" />
              <ChecklistItem checked={data.checklist.profileComplete} label="V.B profile complete" />
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
                Company
              </h3>
              <ChecklistItem checked={data.checklist.startupDeclared} label="Startup declared" />
              <ChecklistItem checked={data.checklist.companiesHouseVerified} label="Companies House verified" />
              <ChecklistItem checked={data.checklist.pitchDeckShared} label="Pitch deck shared" />
              <ChecklistItem checked={data.checklist.financialsShared} label="Financials shared" />
              <ChecklistItem checked={data.checklist.referencesProvided} label="References provided" />
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
                Consented data
              </h3>
              <dl>
                <DataRow
                  label="Founder"
                  value={data.visibleData.name}
                  consented={data.consentedFields.includes('identity')}
                />
                <DataRow
                  label="Startup"
                  value={data.visibleData.startup}
                  consented={data.consentedFields.includes('identity')}
                />
                <DataRow
                  label="Sector"
                  value={data.visibleData.sector}
                  consented={data.consentedFields.includes('sector')}
                />
                <DataRow
                  label="Stage"
                  value={data.visibleData.stage}
                  consented={data.consentedFields.includes('stage')}
                />
                <DataRow
                  label="Raising"
                  value={data.visibleData.raising}
                  consented={data.consentedFields.includes('financials')}
                />
                <DataRow
                  label="Traction"
                  value={data.visibleData.traction}
                  consented={data.consentedFields.includes('traction')}
                />
              </dl>
            </div>
          </div>

          {/* Right: AI summary + consent status */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
              <div className="flex flex-col items-center mb-5">
                <MatchScoreDonut score={data.matchScore} size="lg" />
                <p className="text-xs text-neutral-500 mt-2">Compatibility indicator</p>
              </div>

              {data.matchReasons.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    Why this match
                  </h4>
                  <ul className="space-y-2">
                    {data.matchReasons.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-2 bg-secondary-50 border border-secondary-100 rounded-md px-3 py-2"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-secondary-500 mt-0.5 shrink-0" aria-hidden="true" />
                        <span className="text-xs text-neutral-700">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  Data consent status
                </h4>
                <ConsentStatus label="Identity & role" consented={data.consentedFields.includes('identity')} />
                <ConsentStatus label="Sector & stage" consented={data.consentedFields.includes('sector')} />
                <ConsentStatus label="Traction metrics" consented={data.consentedFields.includes('traction')} />
                <ConsentStatus label="Financial data" consented={data.consentedFields.includes('financials')} />
                <ConsentStatus label="Pitch deck" consented={data.consentedFields.includes('pitch_deck')} />
              </div>

              {!data.consentedFields.includes('financials') && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => selectedId && onRequestAccess(selectedId)}
                >
                  Request data access
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
