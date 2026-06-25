'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Users, MessageSquare, Handshake, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsSummaryResponse, MetricSummary } from '@/app/api/analytics/summary/route';

// ─── Period picker ─────────────────────────────────────────────────────────────

const PERIODS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
] as const;

// ─── Bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ data, color = 'currentColor' }: { data: { date: string; value: number }[]; color?: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 480;
  const h = 120;
  const barGap = 2;
  const barW = Math.max(1, w / data.length - barGap);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      {data.map((pt, i) => {
        const barH = max === 0 ? 0 : (pt.value / max) * (h - 8);
        const x = i * (barW + barGap);
        return (
          <rect
            key={pt.date}
            x={x}
            y={h - barH}
            width={barW}
            height={Math.max(barH, 0)}
            rx={2}
            fill={color}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

// ─── Delta badge ────────────────────────────────────────────────────────────────

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-neutral-400">No prior data</span>;
  const isUp = pct > 0;
  const isDown = pct < 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
        isUp ? 'bg-success-100 text-success-700' : isDown ? 'bg-error-100 text-error-600' : 'bg-neutral-100 text-neutral-500',
      )}
      aria-label={`${pct > 0 ? '+' : ''}${pct}% vs previous period`}
    >
      {isUp && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
      {isDown && <TrendingDown className="h-3 w-3" aria-hidden="true" />}
      {!isUp && !isDown && <Minus className="h-3 w-3" aria-hidden="true" />}
      {pct !== 0 ? `${pct > 0 ? '+' : ''}${pct}%` : 'No change'}
    </span>
  );
}

// ─── Metric card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  summary: MetricSummary;
  barColor: string;
  loading: boolean;
}

function MetricCard({ label, Icon, summary, barColor, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-5 animate-pulse">
        <div className="h-3 w-24 bg-neutral-100 rounded mb-4" />
        <div className="h-8 w-16 bg-neutral-100 rounded mb-4" />
        <div className="h-20 bg-neutral-100 rounded" />
      </div>
    );
  }

  const noData = summary.current === 0 && summary.previous === 0;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</span>
        </div>
        <Delta pct={summary.deltaPercent} />
      </div>

      <p className={cn('text-3xl font-bold', noData ? 'text-neutral-300' : 'text-neutral-900')}>
        {noData ? '—' : summary.current.toLocaleString()}
      </p>

      <div className={cn('h-20 rounded overflow-hidden', noData ? 'bg-neutral-50' : '')}>
        {noData ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-neutral-400">No activity in this period</p>
          </div>
        ) : (
          <BarChart data={summary.sparkline} color={barColor} />
        )}
      </div>

      {!noData && (
        <p className="text-xs text-neutral-400">
          {summary.previous > 0 ? `${summary.previous.toLocaleString()} in previous period` : 'No prior period data'}
        </p>
      )}
    </div>
  );
}

// ─── Activity timeline ─────────────────────────────────────────────────────────

function ActivityTimeline({ data, days }: { data: { date: string; value: number }[]; days: number }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = Math.max(1, Math.floor(data.length / 6));

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">Total activity — last {days} days</h2>
      <div className="h-40 relative">
        <svg viewBox="0 0 480 120" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
          {/* Gridlines */}
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <line
              key={frac}
              x1={0}
              y1={120 - frac * 112}
              x2={480}
              y2={120 - frac * 112}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          ))}
          {/* Area fill */}
          {data.length > 1 && (
            <polygon
              points={[
                `0,120`,
                ...data.map((pt, i) => {
                  const x = (i / (data.length - 1)) * 480;
                  const y = 120 - (pt.value / max) * 112;
                  return `${x},${y}`;
                }),
                `480,120`,
              ].join(' ')}
              fill="var(--color-primary-100, #ede9fe)"
              opacity={0.6}
            />
          )}
          {/* Line */}
          {data.length > 1 && (
            <polyline
              points={data
                .map((pt, i) => {
                  const x = (i / (data.length - 1)) * 480;
                  const y = 120 - (pt.value / max) * 112;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="var(--color-primary-500, #8b5cf6)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </svg>
        {/* X-axis date labels */}
        <div className="flex justify-between mt-1 px-0.5">
          {data
            .filter((_, i) => i % step === 0 || i === data.length - 1)
            .map((pt) => (
              <span key={pt.date} className="text-2xs text-neutral-400">
                {new Date(pt.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/summary?days=${d}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  // Build combined sparkline for activity timeline
  const combinedSparkline = data
    ? (() => {
        const map = new Map<string, number>();
        for (const series of [data.matches.sparkline, data.connections.sparkline, data.messages.sparkline]) {
          for (const pt of series) {
            map.set(pt.date, (map.get(pt.date) ?? 0) + pt.value);
          }
        }
        return Array.from(map.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, value]) => ({ date, value }));
      })()
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Analytics</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Your platform activity at a glance</p>
        </div>

        {/* Period picker */}
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1" role="group" aria-label="Select time period">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-[120ms]',
                days === p.days
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              )}
              aria-pressed={days === p.days}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div role="alert" className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3">
          Failed to load analytics. Please try again.
        </div>
      )}

      {/* Metric cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        aria-live="polite"
        aria-busy={loading}
        aria-label="Analytics metrics"
      >
        <MetricCard
          label="Matches"
          Icon={Handshake}
          summary={data?.matches ?? { current: 0, previous: 0, deltaPercent: null, sparkline: [] }}
          barColor="var(--color-secondary-500, #8b5cf6)"
          loading={loading}
        />
        <MetricCard
          label="Connections"
          Icon={Users}
          summary={data?.connections ?? { current: 0, previous: 0, deltaPercent: null, sparkline: [] }}
          barColor="var(--color-success-500, #22c55e)"
          loading={loading}
        />
        <MetricCard
          label="Messages"
          Icon={MessageSquare}
          summary={data?.messages ?? { current: 0, previous: 0, deltaPercent: null, sparkline: [] }}
          barColor="var(--color-primary-500, #7c3aed)"
          loading={loading}
        />
        <MetricCard
          label="Profile Views"
          Icon={Eye}
          summary={data?.profileViews ?? { current: 0, previous: 0, deltaPercent: null, sparkline: [] }}
          barColor="var(--color-accent-500, #f59e0b)"
          loading={loading}
        />
      </div>

      {/* Activity timeline */}
      {!loading && combinedSparkline.length > 0 && (
        <ActivityTimeline data={combinedSparkline} days={days} />
      )}

      {/* Insufficient data notice */}
      {!loading && data?.insufficientSample && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl px-4 py-3 text-sm text-warning-700">
          Not enough activity yet to show meaningful trends. Keep using the platform and check back soon.
        </div>
      )}
    </div>
  );
}
