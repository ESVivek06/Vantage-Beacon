'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export interface DonutSegment {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerSub?: string;
  title?: string;
  loading?: boolean;
}

const DEFAULT_COLORS = ['#818CF8', '#2DD4BF', '#F472B6', '#D1D5DB'];

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(17,24,39,0.92)',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
  padding: '8px 12px',
};

export function DonutChart({
  segments,
  centerLabel,
  centerSub,
  title,
  loading = false,
}: DonutChartProps) {
  if (loading) {
    return (
      <div
        className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm"
        aria-busy="true"
        aria-label={`Loading ${title ?? 'donut chart'}`}
      >
        {title && <div className="h-4 bg-neutral-200 rounded w-1/3 mb-3 animate-pulse" />}
        <div className="flex items-center gap-6">
          <div className="h-32 w-32 rounded-full bg-neutral-200 animate-pulse flex-shrink-0" />
          <div className="space-y-2 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 bg-neutral-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm">
        {title && <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>}
        <div className="flex flex-col items-center justify-center py-10 text-neutral-300">
          <BarChart3 className="h-10 w-10 mb-2" aria-hidden="true" />
          <p className="text-sm">No data for this period</p>
        </div>
      </div>
    );
  }

  const total = segments.reduce((s, d) => s + d.value, 0);
  const dataLabel = segments.map((s) => `${s.label}: ${((s.value / total) * 100).toFixed(0)}%`).join(', ');

  return (
    <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>}
      <svg
        role="img"
        aria-label={`${title ?? 'Donut chart'} — ${dataLabel}`}
        className="sr-only"
        aria-hidden="false"
      />
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={64}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {segments.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number) => [
                  `${value} (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                  '',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          {centerLabel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-semibold text-neutral-700 leading-tight text-center">
                {centerLabel}
              </span>
              {centerSub && (
                <span className="text-xs text-neutral-400 leading-tight text-center mt-0.5">
                  {centerSub}
                </span>
              )}
            </div>
          )}
        </div>

        <ul className="space-y-2 flex-1 min-w-0" aria-label="Legend">
          {segments.map((s, i) => {
            const pct = total > 0 ? ((s.value / total) * 100).toFixed(0) : 0;
            return (
              <li key={s.label} className="flex items-center gap-2 text-xs text-neutral-600">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="truncate flex-1">{s.label}</span>
                <span className="font-semibold text-neutral-700 flex-shrink-0">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
