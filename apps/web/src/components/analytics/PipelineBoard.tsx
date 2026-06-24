'use client';

import { cn } from '@/lib/utils';
import type { SidePanelContent } from './AnalyticsSidePanel';

export interface DealCard {
  id: string;
  name: string;
  stage: string;
  series?: string;
  sector?: string;
  region?: string;
  matchScore?: number;
  daysInPipeline?: number;
  rationale?: string;
  activities?: Array<{ date: string; text: string }>;
}

const STAGES = [
  { id: 'sourced', label: 'Sourced', color: '#D1D5DB' },
  { id: 'screening', label: 'Screening', color: '#60A5FA' },
  { id: 'due_diligence', label: 'Due Diligence', color: '#FBBF24' },
  { id: 'term_sheet', label: 'Term Sheet', color: '#818CF8' },
  { id: 'closed', label: 'Closed', color: '#34D399' },
];

function scoreColor(score: number | undefined): string {
  if (score === undefined) return 'text-neutral-500';
  if (score >= 8.0) return 'text-success-600';
  if (score >= 6.0) return 'text-neutral-700';
  return 'text-warning-600';
}

interface PipelineBoardProps {
  deals: DealCard[];
  onSelectDeal?: (deal: DealCard) => void;
  loading?: boolean;
}

export function PipelineBoard({ deals, onSelectDeal, loading = false }: PipelineBoardProps) {
  if (loading) {
    return (
      <div
        className="overflow-x-auto"
        aria-busy="true"
        aria-label="Loading deal pipeline"
      >
        <div className="flex gap-4 min-w-max pb-2">
          {STAGES.map((stage) => (
            <div key={stage.id} className="w-52 flex-shrink-0">
              <div className="h-4 bg-neutral-200 rounded mb-3 animate-pulse" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-neutral-100 rounded-xl p-3 mb-2 h-24 animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
        <p className="text-sm">No deals yet.</p>
        <a href="/feed" className="text-sm text-primary-600 hover:underline mt-1">
          View matches →
        </a>
      </div>
    );
  }

  const byStage = STAGES.map((stage) => ({
    ...stage,
    deals: deals.filter((d) => d.stage === stage.id),
  }));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-2">
        {byStage.map((stage) => (
          <div
            key={stage.id}
            className="w-52 flex-shrink-0"
            role="region"
            aria-label={`${stage.label} stage`}
          >
            <div className="mb-3">
              <div
                className="h-0.5 rounded-full mb-2"
                style={{ backgroundColor: stage.color }}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {stage.label}
              </span>
              <span className="ml-2 text-xs text-neutral-400">
                {stage.deals.length} deal{stage.deals.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2">
              {stage.deals.map((deal) => (
                <button
                  key={deal.id}
                  onClick={() => onSelectDeal?.(deal)}
                  className="w-full text-left bg-white border border-neutral-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label={`${deal.name}, ${deal.series ?? ''}, match score ${deal.matchScore ?? 'N/A'}`}
                >
                  <p className="text-sm font-semibold text-neutral-900 truncate">{deal.name}</p>
                  {deal.series && (
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">{deal.series}</p>
                  )}
                  {deal.matchScore !== undefined && (
                    <p className={cn('text-xs font-semibold mt-1.5', scoreColor(deal.matchScore))}>
                      Match {deal.matchScore}
                    </p>
                  )}
                  {deal.daysInPipeline !== undefined && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {deal.daysInPipeline}d in pipeline
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function dealToSidePanelContent(deal: DealCard): SidePanelContent {
  return {
    title: deal.name,
    subtitle: [deal.series, deal.sector, deal.region].filter(Boolean).join(' · '),
    meta: [
      ...(deal.matchScore !== undefined
        ? [{ label: 'Match score', value: `${deal.matchScore}/10` }]
        : []),
      ...(deal.daysInPipeline !== undefined
        ? [{ label: 'Days in pipeline', value: `${deal.daysInPipeline}` }]
        : []),
      ...(deal.sector ? [{ label: 'Sector', value: deal.sector }] : []),
      ...(deal.series ? [{ label: 'Stage', value: deal.series }] : []),
    ],
    rationale: deal.rationale,
    activities: deal.activities,
    actions: [
      { label: 'View profile', onClick: () => {} },
      { label: 'Add note', onClick: () => {} },
    ],
  };
}
