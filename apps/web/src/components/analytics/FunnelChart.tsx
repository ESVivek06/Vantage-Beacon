'use client';

import { cn } from '@/lib/utils';

export interface FunnelStep {
  label: string;
  value: number;
  conversionFromPrev?: number;
  priorValue?: number;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  showComparison?: boolean;
  color?: string;
  title?: string;
  loading?: boolean;
}

const STEP_COLORS = [
  'bg-primary-500',
  'bg-primary-400',
  'bg-primary-300',
  'bg-primary-200',
  'bg-primary-100',
];

export function FunnelChart({
  steps,
  showComparison = false,
  color,
  title,
  loading = false,
}: FunnelChartProps) {
  const maxValue = steps[0]?.value ?? 1;

  const overallConversion =
    steps.length >= 2 && maxValue > 0
      ? ((steps[steps.length - 1].value / maxValue) * 100).toFixed(1)
      : null;

  if (loading) {
    return (
      <div
        className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm"
        aria-busy="true"
        aria-label="Loading funnel chart"
      >
        {title && <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4 animate-pulse" />}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <div className="h-4 bg-neutral-200 rounded w-40 animate-pulse" />
            <div className="flex-1 h-6 bg-neutral-100 rounded-full animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-12 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm">
        {title && <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>}
        <p className="text-sm text-neutral-400 text-center py-8">
          No activity in this period. Widen your date range.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm"
      role="region"
      aria-label={title ?? 'Engagement funnel'}
    >
      {title && <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>}

      <div
        role="table"
        aria-label={title ?? 'Funnel steps'}
        className="space-y-1"
      >
        {steps.map((step, i) => {
          const widthPct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
          const priorWidthPct =
            showComparison && step.priorValue != null && maxValue > 0
              ? (step.priorValue / maxValue) * 100
              : null;

          const barColorClass = color
            ? ''
            : STEP_COLORS[Math.min(i, STEP_COLORS.length - 1)];

          return (
            <div key={step.label} className="flex items-center gap-3 py-1.5" role="row">
              <span
                className="text-sm text-neutral-600 w-40 flex-shrink-0 truncate"
                role="rowheader"
              >
                {step.label}
              </span>

              <div className="flex-1 bg-neutral-100 rounded-full h-6 relative overflow-hidden">
                {priorWidthPct !== null && (
                  <div
                    className="absolute inset-y-0 left-0 bg-neutral-200 rounded-full"
                    style={{ width: `${priorWidthPct}%` }}
                    aria-hidden="true"
                  />
                )}
                <div
                  className={cn('absolute inset-y-0 left-0 rounded-full transition-all', barColorClass)}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: color || undefined,
                  }}
                  role="progressbar"
                  aria-valuenow={step.value}
                  aria-valuemin={0}
                  aria-valuemax={maxValue}
                  aria-label={`${step.label}: ${step.value}`}
                />
              </div>

              <span
                className="text-sm font-semibold text-neutral-900 w-14 text-right flex-shrink-0"
                role="cell"
              >
                {step.value.toLocaleString()}
              </span>

              {step.conversionFromPrev !== undefined && i > 0 && (
                <span
                  className={cn(
                    'text-xs w-12 text-right flex-shrink-0',
                    step.conversionFromPrev >= 30
                      ? 'text-success-600'
                      : step.conversionFromPrev < 15
                      ? 'text-error-600'
                      : 'text-neutral-500',
                  )}
                  role="cell"
                >
                  →{step.conversionFromPrev}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {overallConversion && (
        <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
          Overall conversion: <span className="font-semibold text-neutral-700">{overallConversion}%</span>
        </p>
      )}
    </div>
  );
}
