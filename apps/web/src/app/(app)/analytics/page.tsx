'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatchQualityTab } from './tabs/MatchQualityTab';
import { EngagementFunnelTab } from './tabs/EngagementFunnelTab';
import { DealFlowTab } from './tabs/DealFlowTab';
import { SupplierAnalyticsTab } from './tabs/SupplierAnalyticsTab';
import { PlatformAdminTab } from './tabs/PlatformAdminTab';

type TabId = 'match-quality' | 'engagement' | 'deal-flow' | 'suppliers' | 'platform';

interface Tab {
  id: TabId;
  label: string;
  roles?: string[];
}

const ALL_TABS: Tab[] = [
  { id: 'match-quality', label: 'Match Quality' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'deal-flow', label: 'Deal Flow', roles: ['investor'] },
  { id: 'suppliers', label: 'Suppliers', roles: ['founder', 'admin'] },
  { id: 'platform', label: 'Platform', roles: ['admin'] },
];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? 'freelancer';

  const visibleTabs = ALL_TABS.filter(
    (t) => !t.roles || t.roles.includes(role),
  );

  const [activeTab, setActiveTab] = useState<TabId>(visibleTabs[0]?.id ?? 'match-quality');
  const [dateRange, setDateRange] = useState('Last 30 days');

  const handleExportCSV = useCallback(() => {
    const link = document.createElement('a');
    link.href = `/api/analytics/${activeTab}?format=csv`;
    link.download = `analytics-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            aria-label="Select date range"
            onClick={() => {}}
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {dateRange}
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            aria-label="Export data as CSV"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="border-b border-neutral-200 mb-6 overflow-x-auto"
        role="tablist"
        aria-label="Analytics sections"
      >
        <div className="flex gap-0 min-w-max">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-700 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      {visibleTabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
        >
          {tab.id === 'match-quality' && activeTab === 'match-quality' && <MatchQualityTab role={role} />}
          {tab.id === 'engagement' && activeTab === 'engagement' && <EngagementFunnelTab role={role} />}
          {tab.id === 'deal-flow' && activeTab === 'deal-flow' && <DealFlowTab />}
          {tab.id === 'suppliers' && activeTab === 'suppliers' && <SupplierAnalyticsTab role={role} />}
          {tab.id === 'platform' && activeTab === 'platform' && <PlatformAdminTab />}
        </div>
      ))}
    </div>
  );
}
