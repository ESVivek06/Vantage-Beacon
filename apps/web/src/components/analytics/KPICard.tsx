'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type KPIVariant = 'default' | 'highlight' | 'warning';

interface SparklineData {
  value: number;
}

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  sparkline?: SparklineData[];
  variant?: KPIVariant;
  unit?: string;
  loading?: boolean;
  'aria-label'?: string;
}

function MiniSparkline({ data, color }: { data: SparklineData[]; color: string }) {
  if (data.length < 2) return null;
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 60;
  const h = 20;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h * 0.85 - h * 0.075;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const firstX = 0;
  const lastX = w;
  const baseY = h;
  const fillPath = `M ${firstX} ${baseY} L ${points[0]} L ${points.slice(1).join(' L ')} L ${lastX} ${baseY} Z`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-hidden="true"
      className="hidden sm:block"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#spark-fill-${color.replace('#', '')})`} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KPICard({
  label,
  value,
  trend,
  trendLabel,
  sparkline,
  variant = 'default',
  unit,
  loading = false,
  'aria-label': ariaLabel,
}: KPICardProps) {
  const cardClass = cn(
    'rounded-xl p-5 shadow-sm border',
    variant === 'default' && 'bg-neutral-0 border-neutral-200',
    variant === 'highlight' && 'bg-primary-50 border-primary-200',
    variant === 'warning' && 'bg-warning-50 border-warning-200',
  );

  const valueClass = cn(
    'text-4xl font-bold leading-none',
    variant === 'default' && 'text-neutral-900',
    variant === 'highlight' && 'text-primary-700',
    variant === 'warning' && 'text-warning-700',
  );

  const sparkColor =
    variant === 'highlight' ? '#6366F1' : variant === 'warning' ? '#D97706' : '#818CF8';

  const trendIsPositive = trend !== undefined && trend > 0;
  const trendIsNegative = trend !== undefined && trend < 0;

  const trendClass = cn(
    'text-sm font-medium flex items-center gap-1',
    trendIsPositive && 'text-success-600',
    trendIsNegative && 'text-error-600',
    !trendIsPositive && !trendIsNegative && 'text-neutral-500',
  );

  const displayValue = unit ? `${value}${unit}` : value;

  const computedAriaLabel =
    ariaLabel ??
    `${label}: ${displayValue}${trend !== undefined ? `, trend ${trend > 0 ? '+' : ''}${trend}%` : ''}`;

  if (loading) {
    return (
      <div className={cardClass} aria-busy="true" aria-label={`Loading ${label}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-neutral-200 rounded w-2/3" />
          <div className="h-9 bg-neutral-200 rounded w-1/2" />
          <div className="h-3 bg-neutral-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass} aria-label={computedAriaLabel}>
      <p className="text-sm font-medium text-neutral-500 mb-2">{label}</p>
      <p className={valueClass}>{displayValue}</p>

      {trend !== undefined && (
        <div className={trendClass + ' mt-2'}>
          {trendIsPositive && <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />}
          {trendIsNegative && <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
          {!trendIsPositive && !trendIsNegative && <Minus className="h-3.5 w-3.5" aria-hidden="true" />}
          {trendIsPositive ? '+' : ''}{trend}%
          {trendLabel && <span className="text-neutral-400 font-normal">{trendLabel}</span>}
        </div>
      )}

      {sparkline && sparkline.length >= 2 && (
        <div className="mt-3">
          <MiniSparkline data={sparkline} color={sparkColor} />
        </div>
      )}
    </div>
  );
}
