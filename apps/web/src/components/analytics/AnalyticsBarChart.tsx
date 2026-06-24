'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export interface BarDataPoint {
  label: string;
  value: number;
  targetZone?: 'above' | 'below' | 'normal';
}

interface AnalyticsBarChartProps {
  data: BarDataPoint[];
  orientation?: 'vertical' | 'horizontal';
  color?: string;
  targetValue?: number;
  targetLabel?: string;
  title?: string;
  loading?: boolean;
  height?: number;
  showValueLabels?: boolean;
}

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(17,24,39,0.92)',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
  padding: '8px 12px',
};

function barColor(point: BarDataPoint, defaultColor: string, targetValue?: number): string {
  if (point.targetZone === 'above') return '#4ADE80'; // success-400
  if (point.targetZone === 'below') return '#FBBF24'; // warning-400
  if (targetValue !== undefined) {
    if (point.value >= targetValue) return '#4ADE80';
    if (point.value < targetValue * 0.8) return '#FBBF24';
  }
  return defaultColor;
}

export function AnalyticsBarChart({
  data,
  orientation = 'vertical',
  color = '#818CF8',
  targetValue,
  targetLabel,
  title,
  loading = false,
  height = 220,
}: AnalyticsBarChartProps) {
  if (loading) {
    return (
      <div
        className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm"
        aria-busy="true"
        aria-label={`Loading ${title ?? 'bar chart'}`}
        style={{ height: height + 64 }}
      >
        {title && <div className="h-4 bg-neutral-200 rounded w-1/3 mb-3 animate-pulse" />}
        <div className="animate-pulse h-full flex items-end gap-2 pb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-neutral-200 rounded-t"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
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

  const dataLabel = data.map((d) => `${d.label}: ${d.value}`).join(', ');

  if (orientation === 'horizontal') {
    return (
      <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm">
        {title && <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>}
        <svg role="img" aria-label={`${title ?? 'Bar chart'} — ${dataLabel}`} className="sr-only" />
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={90}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#F9FAFB' }} />
            {targetValue !== undefined && (
              <ReferenceLine
                x={targetValue}
                stroke="#9CA3AF"
                strokeDasharray="4 2"
                label={{ value: targetLabel ?? `${targetValue}`, fill: '#9CA3AF', fontSize: 10 }}
              />
            )}
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColor(entry, color, targetValue)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>}
      <svg role="img" aria-label={`${title ?? 'Bar chart'} — ${dataLabel}`} className="sr-only" />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#F9FAFB' }} />
          {targetValue !== undefined && (
            <ReferenceLine
              y={targetValue}
              stroke="#9CA3AF"
              strokeDasharray="4 2"
              label={{ value: targetLabel ?? `Target: ${targetValue}`, fill: '#9CA3AF', fontSize: 10 }}
            />
          )}
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColor(entry, color, targetValue)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
