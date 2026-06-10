'use client';

import { useEffect, useRef } from 'react';

export interface AnalyticsBarStat {
  label: string;
  value: string | number;
  delta?: string;
  deltaDown?: boolean;
}

export interface AnalyticsBarProps {
  role: 'freelancer' | 'founder';
  stats: AnalyticsBarStat[];
  sparklineData: number[];
  sparklineColor?: string;
}

const DEFAULT_COLORS: Record<'freelancer' | 'founder', string> = {
  freelancer: '#4F46E5', // --color-primary
  founder: '#10B981',   // --color-success
};

const SPARKLINE_W = 120;
const SPARKLINE_H = 40;
const PADDING = 2;

function buildPoints(data: number[]): string {
  if (data.length < 2) {
    return data.map((_, i) => `${i},${SPARKLINE_H / 2}`).join(' ');
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const n = data.length;
  return data
    .map((v, i) => {
      const x = (i / (n - 1)) * SPARKLINE_W;
      const y = SPARKLINE_H - PADDING - ((v - min) / range) * (SPARKLINE_H - PADDING * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function SparklineSkeleton() {
  return (
    <div
      aria-hidden="true"
      data-testid="sparkline-skeleton"
      className="rounded animate-shimmer"
      style={{ width: SPARKLINE_W, height: SPARKLINE_H }}
    />
  );
}

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  const polyRef = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    const el = polyRef.current;
    if (!el) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let length = 500;
    try {
      const measured = (el as unknown as SVGGeometryElement).getTotalLength?.();
      if (measured && measured > 0) length = measured;
    } catch {
      // getTotalLength unavailable in test environment
    }

    el.style.strokeDasharray = String(length);
    el.style.strokeDashoffset = String(length);

    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1s ease-out';
      el.style.strokeDashoffset = '0';
    });
  }, [data]);

  return (
    <svg
      width={SPARKLINE_W}
      height={SPARKLINE_H}
      viewBox={`0 0 ${SPARKLINE_W} ${SPARKLINE_H}`}
      aria-hidden="true"
      data-testid="sparkline-svg"
    >
      <polyline
        ref={polyRef}
        points={buildPoints(data)}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnalyticsBar({ role, stats, sparklineData, sparklineColor }: AnalyticsBarProps) {
  const color = sparklineColor ?? DEFAULT_COLORS[role];
  const hasData = sparklineData.length > 0;

  return (
    <div
      role="region"
      aria-label="Analytics summary"
      data-testid="analytics-bar"
      style={{ height: '72px' }}
      className="w-full sticky top-[60px] z-40 bg-white border-b border-neutral-200 flex items-center px-6 gap-8 shadow-xs"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col min-w-[80px]">
          <span className="text-2xs font-medium uppercase tracking-wide text-neutral-500 leading-none">
            {stat.label}
          </span>
          <span className="text-xl font-bold text-neutral-900 leading-tight mt-0.5">
            {stat.value}
          </span>
          {stat.delta != null && (
            <span
              className={`text-2xs font-medium leading-none mt-0.5 ${
                stat.deltaDown ? 'text-error-600' : 'text-success-600'
              }`}
            >
              {stat.delta}
            </span>
          )}
        </div>
      ))}

      <div className="ml-auto flex items-center" aria-label="14-day activity sparkline">
        {hasData ? (
          <Sparkline data={sparklineData} color={color} />
        ) : (
          <SparklineSkeleton />
        )}
      </div>
    </div>
  );
}
