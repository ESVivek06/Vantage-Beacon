'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Metric {
  label: string;
  value: string | number;
  delta?: number;
  sparkline?: number[];
  aiPowered?: boolean;
  fallback?: boolean;
}

const FREELANCER_DEFAULTS: Metric[] = [
  { label: 'Match Rate', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
  { label: 'Profile Views', value: '—', delta: 0, sparkline: [], fallback: true },
  { label: 'Connections', value: '—', delta: 0, sparkline: [], fallback: true },
];

const FOUNDER_DEFAULTS: Metric[] = [
  { label: 'Pipeline', value: '—', delta: 0, sparkline: [], fallback: true },
  { label: 'Investor Outreach', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
  { label: 'Conversion', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
];

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) {
    return <div className="h-8 w-full bg-neutral-100 rounded animate-pulse" aria-hidden="true" />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');
  return (
    <svg
      width={w}
      height={h}
      aria-hidden="true"
      className="opacity-70 w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeltaBadge({ delta }: { delta?: number }) {
  if (delta === undefined) return null;
  const isUp = delta > 0;
  const isDown = delta < 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
        isUp
          ? 'bg-success-100 text-success-700'
          : isDown
          ? 'bg-error-100 text-error-600'
          : 'bg-neutral-100 text-neutral-500',
      )}
      aria-label={`${delta > 0 ? '+' : ''}${delta}% change`}
    >
      {isUp && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
      {isDown && <TrendingDown className="h-3 w-3" aria-hidden="true" />}
      {!isUp && !isDown && <Minus className="h-3 w-3" aria-hidden="true" />}
      {delta !== 0 && `${delta > 0 ? '+' : ''}${delta}%`}
    </span>
  );
}

export interface AnalyticsBarProps {
  role: 'freelancer' | 'founder';
  metrics?: Metric[];
  loading?: boolean;
}

export function AnalyticsBar({ role, metrics, loading = false }: AnalyticsBarProps) {
  const defaults = role === 'freelancer' ? FREELANCER_DEFAULTS : FOUNDER_DEFAULTS;
  const items = metrics ?? defaults;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-busy="true" aria-label="Loading analytics">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse">
            <div className="h-3 w-24 bg-neutral-100 rounded mb-3" />
            <div className="h-7 w-16 bg-neutral-100 rounded mb-3" />
            <div className="h-8 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={`${role === 'freelancer' ? 'Freelancer' : 'Founder'} analytics`}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      {items.map((metric, i) => (
        <div
          key={`${metric.label}-${i}`}
          className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 flex flex-col gap-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              {metric.label}
            </span>
            {metric.aiPowered && !metric.fallback && (
              <span className="text-2xs font-medium text-secondary-600 bg-secondary-50 px-1.5 py-0.5 rounded-full">
                AI
              </span>
            )}
          </div>
          <div className="flex items-end justify-between mt-1">
            <span
              className={cn(
                'text-2xl font-bold',
                metric.fallback ? 'text-neutral-300' : 'text-neutral-900',
              )}
            >
              {metric.fallback ? '—' : metric.value}
            </span>
            {!metric.fallback && <DeltaBadge delta={metric.delta} />}
          </div>
          <div className={cn('mt-1', metric.fallback ? 'text-neutral-300' : 'text-secondary-500')}>
            {metric.fallback ? (
              <p className="text-xs text-neutral-400 mt-1">Data unavailable</p>
            ) : (
              <Sparkline data={metric.sparkline ?? []} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
