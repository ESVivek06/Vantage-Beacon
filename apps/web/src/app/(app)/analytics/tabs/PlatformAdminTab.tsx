'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { KPICard } from '@/components/analytics/KPICard';
import { FunnelChart, type FunnelStep } from '@/components/analytics/FunnelChart';
import { AnalyticsLineChart } from '@/components/analytics/AnalyticsLineChart';

interface PlatformData {
  kpis: Array<{ label: string; value: string; trend: number }>;
  crossRoleFunnel: {
    freelancer: FunnelStep[];
    founder: FunnelStep[];
    investor: FunnelStep[];
    supplier: FunnelStep[];
  };
  escrowTrend: Array<{ date: string; initiated: number; released: number }>;
  moderation: {
    autoApproved: number;
    autoRejected: number;
    humanReviewed: number;
    appealRate: number;
    appealOverturn: number;
  };
}

type RoleFilter = 'all' | 'freelancer' | 'founder' | 'investor' | 'supplier';

const ROLE_COLORS: Record<string, string> = {
  freelancer: '#818CF8',
  founder: '#14B8A6',
  investor: '#F472B6',
  supplier: '#6B7280',
};

const ROLE_LABELS: Record<string, string> = {
  freelancer: 'Freelancer',
  founder: 'Founder',
  investor: 'Investor',
  supplier: 'Supplier',
};

export function PlatformAdminTab() {
  const [data, setData] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  useEffect(() => {
    fetch('/api/analytics/platform')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const funnelRoles: Array<Exclude<RoleFilter, 'all'>> = ['freelancer', 'founder', 'investor', 'supplier'];

  const activeFunnelRoles = roleFilter === 'all' ? funnelRoles : [roleFilter as Exclude<RoleFilter, 'all'>];

  return (
    <div className="space-y-5">
      {/* KPI rows — 2 rows of 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(loading ? Array.from({ length: 8 }, (_, i) => ({ label: '...', value: '', trend: 0 })) : data?.kpis ?? []).map(
          (kpi, i) => (
            <KPICard
              key={kpi.label + i}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              loading={loading}
            />
          ),
        )}
      </div>

      {/* Cross-role funnel */}
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {(['all', ...funnelRoles] as RoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                roleFilter === r
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              )}
            >
              {r === 'all' ? 'All roles' : ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeFunnelRoles.map((role) => {
            const steps = data?.crossRoleFunnel[role] ?? [];
            const stepsWithConversion = steps.map((s, i) => ({
              ...s,
              conversionFromPrev:
                i > 0 && steps[i - 1].value > 0
                  ? Math.round((s.value / steps[i - 1].value) * 100)
                  : undefined,
            }));
            return (
              <FunnelChart
                key={role}
                title={ROLE_LABELS[role]}
                steps={stepsWithConversion}
                color={ROLE_COLORS[role]}
                loading={loading}
              />
            );
          })}
        </div>
      </div>

      {/* Escrow volume chart */}
      <AnalyticsLineChart
        title="Escrow volume over time"
        data={
          data?.escrowTrend.map((t) => ({
            date: t.date,
            initiated: t.initiated,
            released: t.released,
          })) ?? []
        }
        series={[
          { key: 'initiated', label: 'Initiated (£)', color: '#6366F1' },
          { key: 'released', label: 'Released (£)', color: '#34D399' },
        ]}
        loading={loading}
      />

      {/* Moderation health */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4">Moderation health</h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 bg-neutral-200 rounded w-32 animate-pulse" />
                <div className="flex-1 h-5 bg-neutral-100 rounded-full animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-10 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data && [
              { label: 'Auto-approved', value: data.moderation.autoApproved, color: '#4ADE80' },
              { label: 'Auto-rejected', value: data.moderation.autoRejected, color: '#F87171' },
              { label: 'Human reviewed', value: data.moderation.humanReviewed, color: '#FBBF24' },
              { label: 'Appeal rate', value: data.moderation.appealRate, color: '#818CF8' },
              { label: 'Appeal overturn', value: data.moderation.appealOverturn, color: '#6B7280' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm text-neutral-600 w-36 flex-shrink-0">{label}</span>
                <div className="flex-1 bg-neutral-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label}: ${value}%`}
                  />
                </div>
                <span className="text-sm font-semibold text-neutral-700 w-10 text-right flex-shrink-0">
                  {value}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
