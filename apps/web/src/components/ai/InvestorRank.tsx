'use client';

import { TrendingUp, Clock } from 'lucide-react';
import { useInvestorRank } from '@/hooks/useInvestorRank';
import type { RankedInvestor } from '@/app/api/investors/ranked/route';

interface InvestorRankProps {
  maxItems?: number;
  onSelectInvestor?: (investor: RankedInvestor) => void;
}

function InvestorRankSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading investor rankings">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-neutral-100 h-14" />
      ))}
    </div>
  );
}

/**
 * Ranked investor list for founders.
 * Fallback: recency-based ordering when AI rank signals are unavailable.
 */
export function InvestorRank({ maxItems = 5, onSelectInvestor }: InvestorRankProps) {
  const state = useInvestorRank();

  if (state.status === 'loading') return <InvestorRankSkeleton />;

  if (state.status === 'error') {
    return (
      <p className="text-sm text-neutral-500 py-4 text-center">
        Unable to load investor rankings.
      </p>
    );
  }

  const { investors, recencyFallback } = state;

  if (investors.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-4 text-center">
        No investors found yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {recencyFallback && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>Showing most recent activity (AI ranking unavailable)</span>
        </div>
      )}

      {investors.slice(0, maxItems).map((investor, index) => (
        <button
          key={investor.investorId}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
          onClick={() => onSelectInvestor?.(investor)}
          aria-label={`Investor ${investor.displayName ?? 'Unknown'}, rank ${index + 1}`}
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {investor.displayName ?? 'Investor'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {investor.stage && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-warning-100 text-warning-700 font-medium">
                  {investor.stage.replace(/_/g, ' ')}
                </span>
              )}
              {investor.region && (
                <span className="text-xs text-neutral-500">{investor.region}</span>
              )}
            </div>
          </div>

          {!recencyFallback && (
            <div className="flex-shrink-0 flex items-center gap-1 text-xs text-primary-600">
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              <span>{Math.round(investor.rankScore * 100)}%</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
