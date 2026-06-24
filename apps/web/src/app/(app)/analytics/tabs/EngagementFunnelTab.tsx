'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FunnelChart } from '@/components/analytics/FunnelChart';
import { AnalyticsLineChart } from '@/components/analytics/AnalyticsLineChart';

interface EngagementData {
  funnel: Array<{ label: string; value: number; conversionFromPrev?: number }>;
  trend: Array<{ date: string; profileViews: number; messages: number; conversions: number }>;
  byMatchType: Array<{
    type: string;
    matched: number;
    responded: number;
    converted: number;
    responseRate: number;
  }>;
}

const ZOOM_OPTS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

export function EngagementFunnelTab({ role }: { role: string }) {
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [zoom, setZoom] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    fetch('/api/analytics/engagement-funnel')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const trendData = data?.trend.slice(-zoom) ?? [];

  return (
    <div className="space-y-5">
      {/* Funnel + period comparison toggle */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowComparison(false)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              !showComparison
                ? 'bg-primary-100 text-primary-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            This period
          </button>
          <button
            onClick={() => setShowComparison(true)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              showComparison
                ? 'bg-primary-100 text-primary-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            vs. Previous
          </button>
        </div>

        <FunnelChart
          title="Engagement funnel"
          steps={
            data?.funnel.map((s, i) => ({
              label: s.label,
              value: s.value,
              conversionFromPrev: s.conversionFromPrev,
              priorValue: showComparison ? Math.floor(s.value * (0.8 + Math.random() * 0.3)) : undefined,
            })) ?? []
          }
          showComparison={showComparison}
          loading={loading}
        />
      </div>

      {/* Engagement over time */}
      <div>
        <div className="flex items-center justify-end gap-1 mb-2">
          {ZOOM_OPTS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setZoom(opt.days as 7 | 30 | 90)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                zoom === opt.days
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <AnalyticsLineChart
          title="Engagement over time"
          data={trendData.map((t) => ({
            date: t.date,
            profileViews: t.profileViews,
            messages: t.messages,
            conversions: t.conversions,
          }))}
          series={[
            { key: 'profileViews', label: 'Profile views', color: '#6366F1' },
            { key: 'messages', label: 'Messages', color: '#14B8A6' },
            { key: 'conversions', label: 'Conversions', color: '#F472B6', yAxisId: 'right' },
          ]}
          dualAxis
          loading={loading}
        />
      </div>

      {/* By match type — Founder only */}
      {(role === 'founder' || role === 'admin') && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-700">Engagement by match type</h3>
          </div>
          {loading ? (
            <div className="p-5 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-primary-600 uppercase tracking-wider bg-primary-50/50">
                      Freelancers
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-secondary-600 uppercase tracking-wider bg-secondary-50/50">
                      Investors
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-accent-600 uppercase tracking-wider bg-accent-50/50">
                      Suppliers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(['Matched', 'Responded', 'Converted', 'Response rate'] as const).map((row) => (
                    <tr key={row} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 text-neutral-600 font-medium">{row}</td>
                      {data?.byMatchType.map((col) => {
                        const val =
                          row === 'Matched'
                            ? col.matched
                            : row === 'Responded'
                            ? col.responded
                            : row === 'Converted'
                            ? col.converted
                            : `${col.responseRate}%`;
                        return (
                          <td key={col.type} className="px-5 py-3 text-center text-neutral-900 font-semibold">
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
