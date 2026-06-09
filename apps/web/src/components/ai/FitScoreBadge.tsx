'use client';

import { Brain } from 'lucide-react';

interface FitScoreBadgeProps {
  score: number | undefined;
  modelCold?: boolean;
  className?: string;
}

/**
 * Displays a founder fit score badge.
 * Fallback: hide entirely when modelCold or score is undefined.
 */
export function FitScoreBadge({ score, modelCold = false, className = '' }: FitScoreBadgeProps) {
  // Model cold or no score — suppress entirely (graceful degradation)
  if (modelCold || score === undefined) return null;

  const pct = Math.round(score * 100);

  let colorClass: string;
  if (pct >= 80) colorClass = 'bg-success-100 text-success-700 border-success-200';
  else if (pct >= 60) colorClass = 'bg-warning-100 text-warning-700 border-warning-200';
  else colorClass = 'bg-neutral-100 text-neutral-600 border-neutral-200';

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass} ${className}`}
      aria-label={`AI fit score: ${pct} percent`}
    >
      <Brain className="h-3 w-3" aria-hidden="true" />
      Fit {pct}%
    </span>
  );
}
