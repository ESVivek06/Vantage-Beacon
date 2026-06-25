'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DetectionLabelChipProps {
  label: string;
  confidence: number;
  category?: string;
  className?: string;
}

export function DetectionLabelChip({
  label,
  confidence,
  category,
  className,
}: DetectionLabelChipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isHighConfidence = confidence >= 80;
  const chipClass = isHighConfidence
    ? 'bg-error-100 text-error-700 border-error-200'
    : 'bg-warning-50 text-warning-700 border-warning-200';

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-describedby={`chip-tooltip-${label.replace(/\s/g, '-')}`}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium cursor-default',
          chipClass,
          className,
        )}
      >
        {label}
        <span className="text-2xs opacity-70 font-normal">{confidence}%</span>
      </button>

      {showTooltip && (
        <div
          id={`chip-tooltip-${label.replace(/\s/g, '-')}`}
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50',
            'px-2.5 py-1.5 rounded-md bg-neutral-900 text-white text-xs',
            'whitespace-nowrap shadow-lg pointer-events-none',
          )}
        >
          <p className="font-semibold">{label}</p>
          <p className="text-neutral-300">Confidence: {confidence}%</p>
          {category && <p className="text-neutral-400">Category: {category}</p>}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
        </div>
      )}
    </span>
  );
}
