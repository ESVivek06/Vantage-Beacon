'use client';

import { Sparkles } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number | undefined;
  isNew?: boolean;
  className?: string;
}

/**
 * Displays an AI match score badge.
 * Fallback: hide if score < 50%; show "New" badge if isNew and no score.
 */
export function MatchScoreBadge({ score, isNew = false, className = '' }: MatchScoreBadgeProps) {
  // Hide if score is below 50% threshold
  if (score !== undefined && score < 0.5) {
    if (isNew) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 ${className}`}
          aria-label="New match"
        >
          New
        </span>
      );
    }
    return null;
  }

  // No score yet but is new
  if (score === undefined && isNew) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 ${className}`}
        aria-label="New match"
      >
        New
      </span>
    );
  }

  // No score and not new — hide
  if (score === undefined) return null;

  const pct = Math.round(score * 100);

  let colorClass: string;
  if (pct >= 85) colorClass = 'bg-success-100 text-success-700 border-success-200';
  else if (pct >= 65) colorClass = 'bg-warning-100 text-warning-700 border-warning-200';
  else colorClass = 'bg-primary-50 text-primary-700 border-primary-200';

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass} ${className}`}
      aria-label={`AI match score: ${pct} percent`}
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      {pct}%
    </span>
  );
}
