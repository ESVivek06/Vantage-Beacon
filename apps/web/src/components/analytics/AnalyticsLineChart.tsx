'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export interface LineDataPoint {
  date: string;
  [key: string]: number | string;
}

export interface LineSeries {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
  yAxisId?: 'left' | 'right';
}

interface AnalyticsLineChartProps {
  data: LineDataPoint[];
  series: LineSeries[];
  targetValue?: number;
  targetLabel?: string;
  dualAxis?: boolean;
  xAxisLabel?: string;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  title?: string;
  loading?: boolean;
  height?: number;
}

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(17,24,39,0.92)',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
  padding: '8px 12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
};

export function AnalyticsLineChart({
  data,
  series,
  targetValue,
  targetLabel,
  dualAxis = false,
  title,
  loading = false,
  height = 220,
}: AnalyticsLineChartProps) {
  if (loading) {
    return (
      <div
        className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm"
        aria-busy="true"
        aria-label={`Loading ${title ?? 'chart'}`}
        style={{ height: height + 64 }}
      >
        {title && <div className="h-4 bg-neutral-200 rounded w-1/3 mb-3 animate-pulse" />}
        <div className="animate-pulse flex flex-col items-center justify-center h-full gap-2 pb-8">
          <div className="h-3 w-3/4 bg-neutral-200 rounded" />
          <div className="h-3 w-2/3 bg-neutral-100 rounded" />
          <div className="h-3 w-4/5 bg-neutral-200 rounded" />
          <div className="h-3 w-1/2 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  const dataLabel =
    data.length > 0
      ? series.map((s) => `${s.label}: ${data.map((d) => d[s.key]).join(', ')}`).join('; ')
      : 'No data';

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

  return (
    <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>}
      <svg
        role="img"
        aria-label={`${title ?? 'Line chart'} — ${dataLabel}`}
        className="sr-only"
        aria-hidden="false"
      />
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
          />
          {dualAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
            />
          )}
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
          {series.length > 1 && (
            <Legend
              iconSize={10}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#6B7280' }}
            />
          )}
          {targetValue !== undefined && (
            <ReferenceLine
              yAxisId="left"
              y={targetValue}
              stroke="#9CA3AF"
              strokeDasharray="4 2"
              label={{
                value: targetLabel ?? `Target: ${targetValue}`,
                fill: '#9CA3AF',
                fontSize: 10,
              }}
            />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              strokeDasharray={s.dashed ? '4 2' : undefined}
              yAxisId={dualAxis ? (s.yAxisId ?? 'left') : 'left'}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
