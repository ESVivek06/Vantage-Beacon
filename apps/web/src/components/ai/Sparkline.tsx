'use client';

import { useSparkline } from '@/hooks/useSparkline';

interface SparklineProps {
  role: 'freelancer' | 'founder';
  days?: number;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

function SparklineSkeleton({ width, height }: { width: number; height: number }) {
  return (
    <div
      className="animate-pulse rounded bg-neutral-200"
      style={{ width, height }}
      role="status"
      aria-label="Loading sparkline"
    />
  );
}

/**
 * SVG sparkline for 14-day rolling platform event data.
 * Fallback: skeleton shimmer when loading or data insufficient.
 */
export function Sparkline({
  role,
  days = 14,
  width = 120,
  height = 32,
  color,
  className = '',
}: SparklineProps) {
  const state = useSparkline(role, days);

  const lineColor = color ?? (role === 'founder' ? '#10B981' : '#4F46E5');

  if (state.status === 'loading') {
    return <SparklineSkeleton width={width} height={height} />;
  }

  if (state.status === 'insufficient-sample' || state.status === 'error') {
    // Show shimmer for insufficient data (graceful degradation)
    return (
      <div
        className="rounded bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 animate-pulse"
        style={{ width, height }}
        aria-label="Sparkline data unavailable"
        role="img"
      />
    );
  }

  const { data } = state;
  const values = data.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = 0;
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height * 0.85 - height * 0.075;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = points.join(' ');

  // Build fill path (close polygon below the line)
  const firstX = 0;
  const lastX = width;
  const baseY = height;
  const fillPath = `M ${firstX} ${baseY} L ${points[0]} L ${points.slice(1).join(' L ')} L ${lastX} ${baseY} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={`${days}-day activity sparkline`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`sparkline-fill-${role}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path
        d={fillPath}
        fill={`url(#sparkline-fill-${role})`}
      />

      {/* Line */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
