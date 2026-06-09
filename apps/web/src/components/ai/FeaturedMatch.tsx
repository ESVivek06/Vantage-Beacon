'use client';

import { Star, Sparkles } from 'lucide-react';
import { useMatchScores } from '@/hooks/useMatchScores';
import { MatchScoreBadge } from './MatchScoreBadge';

interface FeaturedMatchProps {
  onViewMatch?: (matchId: string, targetId: string) => void;
}

/**
 * Featured Match banner — shows top AI match (score ≥90% + posted within 24h).
 * Fallback: first unread match when no featured match qualifies.
 */
export function FeaturedMatch({ onViewMatch }: FeaturedMatchProps) {
  const state = useMatchScores();

  if (state.status === 'loading') {
    return (
      <div
        className="animate-pulse rounded-lg bg-neutral-100 h-20 w-full"
        aria-label="Loading featured match"
        role="status"
      />
    );
  }

  if (state.status === 'model-cold' || state.status === 'error') return null;

  const { featuredMatch } = state;
  if (!featuredMatch) return null;

  const pct = Math.round(featuredMatch.score * 100);
  const isTrulyFeatured = featuredMatch.isFeatured;

  return (
    <div
      className={[
        'flex items-center gap-3 rounded-lg border p-4',
        isTrulyFeatured
          ? 'border-primary-200 bg-primary-50'
          : 'border-neutral-200 bg-neutral-50',
      ].join(' ')}
      role="region"
      aria-label={isTrulyFeatured ? 'Featured AI match' : 'Top unread match'}
    >
      <div className="flex-shrink-0">
        {isTrulyFeatured ? (
          <Star
            className="h-6 w-6 text-primary-600"
            aria-hidden="true"
            fill="currentColor"
          />
        ) : (
          <Sparkles className="h-6 w-6 text-neutral-400" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate">
          {isTrulyFeatured ? 'Top AI Match' : 'New Match'}
          {featuredMatch.target.displayName && (
            <span className="font-normal text-neutral-600">
              {' '}— {featuredMatch.target.displayName}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <MatchScoreBadge score={featuredMatch.score} isNew={featuredMatch.isNew} />
          {featuredMatch.explainability.topReasons.slice(0, 1).map((reason) => (
            <span key={reason} className="text-xs text-neutral-500 truncate">
              {reason}
            </span>
          ))}
        </div>
      </div>

      {onViewMatch && (
        <button
          className="flex-shrink-0 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          onClick={() => onViewMatch(featuredMatch.matchId, featuredMatch.targetId)}
          aria-label={`View ${pct}% match`}
        >
          View →
        </button>
      )}
    </div>
  );
}
