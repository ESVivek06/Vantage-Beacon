'use client';

import { useEffect, useState, useCallback } from 'react';
import { KPICard } from '@/components/analytics/KPICard';
import { AnalyticsSidePanel, type SidePanelContent } from '@/components/analytics/AnalyticsSidePanel';
import { cn } from '@/lib/utils';

interface Supplier {
  id: string;
  name: string;
  fulfilmentScore: number;
  responseHours: number;
  disputeRate: number;
  escrows: number;
  status: string;
  activities?: Array<{ date: string; text: string }>;
}

interface SuppliersData {
  kpis: {
    activeSuppliers: number;
    avgFulfilmentScore: number;
    avgFulfilmentTrend: number;
    disputeRate: number;
    disputeRateTrend: number;
    avgResponseHours: number;
    avgResponseTrend: number;
  };
  suppliers: Supplier[];
}

function scoreClass(score: number) {
  if (score >= 8.0) return 'text-success-600';
  if (score >= 6.0) return 'text-neutral-700';
  return 'text-warning-600';
}

function disputeVariant(rate: number): 'default' | 'warning' {
  if (rate > 5) return 'warning';
  return 'default';
}

function supplierToPanel(s: Supplier): SidePanelContent {
  return {
    title: s.name,
    subtitle: s.status,
    meta: [
      { label: 'Fulfilment score', value: `${s.fulfilmentScore}/10` },
      { label: 'Response time', value: `${s.responseHours} hrs` },
      { label: 'Dispute rate', value: `${s.disputeRate}%` },
      { label: 'Escrows', value: `${s.escrows}` },
    ],
    activities: s.activities,
    actions: [
      { label: 'View profile', onClick: () => {} },
      { label: 'Contact', onClick: () => {} },
    ],
  };
}

export function SupplierAnalyticsTab({ role }: { role: string }) {
  const [data, setData] = useState<SuppliersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/suppliers')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = useCallback((s: Supplier) => {
    setSelectedSupplier(s);
    setPanelOpen(true);
  }, []);

  const handleClose = useCallback(() => setPanelOpen(false), []);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active suppliers"
          value={data?.kpis.activeSuppliers ?? 0}
          loading={loading}
        />
        <KPICard
          label="Avg fulfilment score"
          value={`${data?.kpis.avgFulfilmentScore ?? 0}/10`}
          trend={data?.kpis.avgFulfilmentTrend}
          variant={
            (data?.kpis.avgFulfilmentScore ?? 0) >= 8
              ? 'highlight'
              : (data?.kpis.avgFulfilmentScore ?? 0) < 6
              ? 'warning'
              : 'default'
          }
          loading={loading}
        />
        <KPICard
          label="Dispute rate"
          value={`${data?.kpis.disputeRate ?? 0}%`}
          trend={data?.kpis.disputeRateTrend}
          variant={disputeVariant(data?.kpis.disputeRate ?? 0)}
          loading={loading}
        />
        <KPICard
          label="Avg response time"
          value={`${data?.kpis.avgResponseHours ?? 0} hrs`}
          trend={data?.kpis.avgResponseTrend}
          loading={loading}
        />
      </div>

      {/* Supplier table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-700">Supplier comparison</h3>
        </div>
        {loading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-4 bg-neutral-200 rounded flex-1 animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        ) : data?.suppliers.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-400">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-neutral-50">
                  {['Supplier', 'Fulfilment', 'Response', 'Dispute rate', 'Escrows', 'Status'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data?.suppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => handleSelect(s)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelect(s)}
                    role="button"
                    aria-label={`View details for ${s.name}`}
                  >
                    <td className="px-5 py-3 font-medium text-neutral-900">{s.name}</td>
                    <td className={cn('px-5 py-3 font-semibold', scoreClass(s.fulfilmentScore))}>
                      {s.fulfilmentScore}
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{s.responseHours} hrs</td>
                    <td
                      className={cn(
                        'px-5 py-3 font-semibold',
                        s.disputeRate > 5 ? 'text-warning-600' : 'text-neutral-700',
                      )}
                    >
                      {s.disputeRate}%
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{s.escrows}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnalyticsSidePanel
        open={panelOpen}
        onClose={handleClose}
        content={selectedSupplier ? supplierToPanel(selectedSupplier) : null}
      />
    </div>
  );
}
