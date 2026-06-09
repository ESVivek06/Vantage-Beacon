'use client';

import { Users, Sparkles } from 'lucide-react';
import { useInvestorRank } from '@/hooks/useInvestorRank';
import type { RankedInvestor } from '@/app/api/investors/ranked/route';

interface InvestorCalloutProps {
  onSelectInvestor?: (investor: RankedInvestor) => void;
}

/**
 * Callout banner for top 3 investors by fund × sector match.
 * Suppressed entirely if fewer than 2 qualified matches exist.
 */
export function InvestorCallout({ onSelectInvestor }: InvestorCalloutProps) {
  const state = useInvestorRank();

  if (state.status === 'loading') {
    return (
      <div
        className="animate-pulse rounded-lg bg-neutral-100 h-24 w-full"
        role="status"
        aria-label="Loading investor callout"
      />
    );
  }

  // Suppress on error, no investors, or explicit suppression flag
  if (state.status === 'error') return null;
  if (state.calloutSuppressed) return null;

  const callouts = state.investors.filter((i) => i.isCallout);

  // Suppress if fewer than 2 qualified callout investors
  if (callouts.length < 2) return null;

  return (
    <div
      className="rounded-lg border border-primary-200 bg-primary-50 p-4"
      role="region"
      aria-label="Top investor matches"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary-600" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-primary-800">Top Investor Matches</h3>
      </div>

      <div className="space-y-2">
        {callouts.slice(0, 3).map((investor) => (
          <button
            key={investor.investorId}
            className="w-full flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
            onClick={() => onSelectInvestor?.(investor)}
            aria-label={`View investor ${investor.displayName ?? 'Unknown'}`}
          >
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary-700" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {investor.displayName ?? 'Investor'}
              </p>
              {investor.fundSectors.length > 0 && (
                <p className="text-xs text-neutral-500 truncate">
                  {investor.fundSectors.slice(0, 2).join(' · ')}
                </p>
              )}
            </div>
            {investor.stage && (
              <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded bg-warning-100 text-warning-700 font-medium">
                {investor.stage.replace(/_/g, ' ')}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
