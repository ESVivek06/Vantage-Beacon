'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/analytics/KPICard';
import { AnalyticsBarChart } from '@/components/analytics/AnalyticsBarChart';
import { DonutChart } from '@/components/analytics/DonutChart';
import { AnalyticsLineChart } from '@/components/analytics/AnalyticsLineChart';
import { cn } from '@/lib/utils';

interface MatchQualityData {
  kpis: {
    matchRate: number;
    matchRateTrend: number;
    accepted: number;
    acceptedTrend: number;
    declined: number;
    declinedTrend: number;
    avgScore: number;
    avgScoreTrend: number;
  };
  scoreDistribution: Array<{ label: string; value: number }>;
  declineReasons: Array<{ label: string; value: number }>;
  trend: Array<{ date: string; acceptanceRate: number; avgScore: number }>;
  topMatches: Array<{
    id: string;
    name: string;
    score: number;
    status: string;
    matchDate: string;
  }>;
}

function scoreClass(score: number) {
  if (score >= 8.0) return 'text-success-600';
  if (score >= 6.0) return 'text-neutral-700';
  return 'text-warning-600';
}

export function MatchQualityTab({ role }: { role: string }) {
  const [data, setData] = useState<MatchQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/match-quality')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Match acceptance rate"
          value={`${data?.kpis.matchRate ?? 0}%`}
          trend={data?.kpis.matchRateTrend}
          trendLabel=" vs last period"
          sparkline={data?.trend?.slice(-7).map((t) => ({ value: t.acceptanceRate }))}
          variant="highlight"
          loading={loading}
        />
        <KPICard
          label="Accepted"
          value={data?.kpis.accepted ?? 0}
          trend={data?.kpis.acceptedTrend}
          trendLabel=" vs last period"
          loading={loading}
        />
        <KPICard
          label="Declined"
          value={data?.kpis.declined ?? 0}
          trend={data?.kpis.declinedTrend}
          trendLabel=" vs last period"
          loading={loading}
        />
        <KPICard
          label="Avg match score"
          value={`${data?.kpis.avgScore ?? 0}/10`}
          trend={data?.kpis.avgScoreTrend}
          trendLabel=" vs last period"
          sparkline={data?.trend?.slice(-7).map((t) => ({ value: t.avgScore }))}
          loading={loading}
        />
      </div>

      {/* Score histogram + Decline reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnalyticsBarChart
          title="Match score distribution"
          data={
            data?.scoreDistribution.map((d) => ({
              label: d.label,
              value: d.value,
            })) ?? []
          }
          targetValue={data ? Math.round(data.scoreDistribution.reduce((a, b) => a + b.value, 0) * 0.3) : undefined}
          targetLabel="Avg target"
          color="#818CF8"
          loading={loading}
        />
        <DonutChart
          title="Decline reasons"
          segments={
            data?.declineReasons.map((d) => ({
              label: d.label,
              value: d.value,
            })) ?? []
          }
          centerLabel={data ? `${data.kpis.declined}` : undefined}
          centerSub="Declined"
          loading={loading}
        />
      </div>

      {/* Trend line */}
      <AnalyticsLineChart
        title="Match quality over time"
        data={
          data?.trend.map((t) => ({
            date: t.date,
            acceptanceRate: Math.round(t.acceptanceRate),
            avgScore: parseFloat((t.avgScore).toFixed(1)),
          })) ?? []
        }
        series={[
          { key: 'acceptanceRate', label: 'Acceptance rate (%)', color: '#6366F1' },
          { key: 'avgScore', label: 'Avg score', color: '#14B8A6', yAxisId: 'right' },
        ]}
        targetValue={70}
        targetLabel="Target 70%"
        dualAxis
        loading={loading}
      />

      {/* Top matches table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-700">Top matches</h3>
        </div>
        {loading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex gap-4">
                <div className="h-4 bg-neutral-200 rounded flex-1 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-12 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        ) : data?.topMatches.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-400">No records found.</div>
        ) : (
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Match
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Match date
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data?.topMatches.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-neutral-900">{m.name}</td>
                  <td className={cn('px-5 py-3 font-semibold', scoreClass(m.score))}>{m.score}</td>
                  <td className="px-5 py-3 text-neutral-600">{m.status}</td>
                  <td className="px-5 py-3 text-neutral-500">{m.matchDate}</td>
                  <td className="px-5 py-3">
                    <button className="text-xs text-primary-600 hover:underline font-medium">
                      {m.status === 'Accepted' ? 'Message' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
