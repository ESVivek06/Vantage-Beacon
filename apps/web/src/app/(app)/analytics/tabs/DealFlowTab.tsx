'use client';

import { useEffect, useState, useCallback } from 'react';
import { KPICard } from '@/components/analytics/KPICard';
import { PipelineBoard, dealToSidePanelContent, type DealCard } from '@/components/analytics/PipelineBoard';
import { AnalyticsSidePanel } from '@/components/analytics/AnalyticsSidePanel';
import { AnalyticsBarChart } from '@/components/analytics/AnalyticsBarChart';
import { AnalyticsLineChart } from '@/components/analytics/AnalyticsLineChart';

interface DealsData {
  kpis: {
    activeDeals: number;
    activeDealsTrend: number;
    avgVelocityDays: number;
    closeRate: number;
    closeRateTrend: number;
    totalDeployed: string;
    totalDeployedTrend: number;
  };
  pipeline: DealCard[];
  thesisAlignment: Array<{ label: string; value: number }>;
  velocityTrend: Array<{ date: string; yourAvg: number; platformAvg: number }>;
}

export function DealFlowTab() {
  const [data, setData] = useState<DealsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<DealCard | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/deals')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectDeal = useCallback((deal: DealCard) => {
    setSelectedDeal(deal);
    setPanelOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
  }, []);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active deals"
          value={data?.kpis.activeDeals ?? 0}
          trend={data?.kpis.activeDealsTrend}
          trendLabel=" vs last month"
          variant="highlight"
          loading={loading}
        />
        <KPICard
          label="Avg deal velocity"
          value={data?.kpis.avgVelocityDays ?? 0}
          unit=" days"
          loading={loading}
        />
        <KPICard
          label="Close rate"
          value={`${data?.kpis.closeRate ?? 0}%`}
          trend={data?.kpis.closeRateTrend}
          trendLabel=" vs last period"
          loading={loading}
        />
        <KPICard
          label="Total deployed"
          value={data?.kpis.totalDeployed ?? '£0'}
          trend={data?.kpis.totalDeployedTrend}
          trendLabel=" vs last period"
          loading={loading}
        />
      </div>

      {/* Pipeline board */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4">Deal Pipeline</h3>
        <PipelineBoard
          deals={data?.pipeline ?? []}
          onSelectDeal={handleSelectDeal}
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnalyticsBarChart
          title="Thesis alignment — matched deals"
          orientation="horizontal"
          data={
            data?.thesisAlignment.map((t) => ({
              label: t.label,
              value: t.value,
            })) ?? []
          }
          color="#818CF8"
          loading={loading}
        />
        <AnalyticsLineChart
          title="Deal velocity over time"
          data={
            data?.velocityTrend.map((t) => ({
              date: t.date,
              yourAvg: t.yourAvg,
              platformAvg: t.platformAvg,
            })) ?? []
          }
          series={[
            { key: 'yourAvg', label: 'Your avg (days)', color: '#6366F1' },
            { key: 'platformAvg', label: 'Platform avg', color: '#9CA3AF', dashed: true },
          ]}
          loading={loading}
        />
      </div>

      {/* Side panel */}
      <AnalyticsSidePanel
        open={panelOpen}
        onClose={handleClose}
        content={selectedDeal ? dealToSidePanelContent(selectedDeal) : null}
      />
    </div>
  );
}
