'use client';

import { useState } from 'react';
import { TrendingUp, Briefcase, FileSearch, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InvestorMatchCard } from './InvestorMatchCard';
import type { InvestorMatchCardProps } from './InvestorMatchCard';
import { DealFlowFilters } from './DealFlowFilters';
import type { DealFlowFilterState } from './DealFlowFilters';
import { InvestmentInterestModal } from './InvestmentInterestModal';
import type { InterestPayload } from './InvestmentInterestModal';
import { PortfolioPanel } from './PortfolioPanel';
import { DueDiligencePanel } from './DueDiligencePanel';

type InvestorTab = 'deal_flow' | 'portfolio' | 'due_diligence' | 'settings';

const TAB_DEF: { id: InvestorTab; label: string; icon: React.ElementType }[] = [
  { id: 'deal_flow', label: 'Deal Flow', icon: TrendingUp },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'due_diligence', label: 'Due Diligence', icon: FileSearch },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface InvestorDashboardProps {
  userName: string;
}

export function InvestorDashboard({ userName: _userName }: InvestorDashboardProps) {
  const [activeTab, setActiveTab] = useState<InvestorTab>('deal_flow');
  const [deals] = useState<InvestorMatchCardProps[]>([]);
  const [_filters, setFilters] = useState<DealFlowFilterState>({
    stage: null,
    sector: null,
    region: null,
    sort: 'match_score',
  });
  const [interestTarget, setInterestTarget] = useState<{ id: string; founderName: string; startupName?: string } | null>(null);

  function handleExpressInterest(id: string) {
    const deal = deals.find((d) => d.id === id);
    if (deal) {
      setInterestTarget({ id, founderName: deal.founderName, startupName: deal.startupName });
    }
  }

  async function handleInterestSubmit(payload: InterestPayload) {
    await fetch('/api/investor/interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Investor portal sections"
        className="flex gap-1 bg-neutral-100 rounded-xl p-1"
      >
        {TAB_DEF.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`investor-panel-${id}`}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
              activeTab === id
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Deal Flow panel */}
      <section
        id="investor-panel-deal_flow"
        role="tabpanel"
        aria-labelledby="tab-deal_flow"
        hidden={activeTab !== 'deal_flow'}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Deal Flow</h2>
        </div>

        <DealFlowFilters onFilterChange={setFilters} />

        {deals.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
            <TrendingUp className="h-8 w-8 text-neutral-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-neutral-500 mb-1">No deals match your current filters.</p>
            <p className="text-xs text-neutral-400">
              As founders build profiles on V.B, AI-matched deals will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            {deals.map((d) => (
              <InvestorMatchCard
                key={d.id}
                {...d}
                onExpressInterest={handleExpressInterest}
              />
            ))}
          </div>
        )}
      </section>

      {/* Portfolio panel */}
      <section
        id="investor-panel-portfolio"
        role="tabpanel"
        aria-labelledby="tab-portfolio"
        hidden={activeTab !== 'portfolio'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Portfolio</h2>
        <PortfolioPanel connections={[]} />
      </section>

      {/* Due Diligence panel */}
      <section
        id="investor-panel-due_diligence"
        role="tabpanel"
        aria-labelledby="tab-due_diligence"
        hidden={activeTab !== 'due_diligence'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Due Diligence</h2>
        <DueDiligencePanel
          portfolio={[]}
          onLoadData={async () => ({
            matchScore: 0,
            matchReasons: [],
            checklist: {
              emailVerified: false,
              linkedInConnected: false,
              profileComplete: false,
              startupDeclared: false,
              companiesHouseVerified: false,
              pitchDeckShared: false,
              financialsShared: false,
              referencesProvided: false,
            },
            consentedFields: [],
            visibleData: {},
          })}
          onRequestAccess={() => {}}
        />
      </section>

      {/* Settings panel */}
      <section
        id="investor-panel-settings"
        role="tabpanel"
        aria-labelledby="tab-settings"
        hidden={activeTab !== 'settings'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Investor Settings</h2>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-8 text-center">
          <p className="text-sm text-neutral-500">Investment thesis and notification preferences coming soon.</p>
        </div>
      </section>

      {/* Investment Interest modal */}
      <InvestmentInterestModal
        targetId={interestTarget?.id ?? ''}
        targetFounderName={interestTarget?.founderName ?? ''}
        targetStartupName={interestTarget?.startupName}
        open={!!interestTarget}
        onClose={() => setInterestTarget(null)}
        onSubmit={handleInterestSubmit}
      />
    </div>
  );
}
