'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ChevronRight, LayoutDashboard, Users, Inbox, TrendingUp, Banknote } from 'lucide-react';
import { EscrowDashboardTab } from '@/components/escrow/EscrowDashboardTab';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/graphql';
import { DASHBOARD_METRICS_QUERY } from '@/lib/queries';

// Shared
import { AnalyticsBar } from '@/components/dashboard/AnalyticsBar';
import type { Metric } from '@/components/dashboard/AnalyticsBar';

// Investor components
import { InvestorDashboard } from '@/components/dashboard/investor/InvestorDashboard';

// Stakeholder components
import { StakeholderDashboard } from '@/components/dashboard/stakeholder/StakeholderDashboard';

// Freelancer components
import { MatchCard } from '@/components/MatchCard';
import type { MatchCardProps } from '@/components/MatchCard';
import { ProfileRing } from '@/components/dashboard/freelancer/ProfileRing';
import { AvailabilityToggle } from '@/components/dashboard/freelancer/AvailabilityToggle';
import { FilterTabs } from '@/components/dashboard/freelancer/FilterTabs';
import { InboxItem } from '@/components/dashboard/freelancer/InboxItem';
import type { InboxItemProps } from '@/components/dashboard/freelancer/InboxItem';

// Founder components
import { KanbanBoard } from '@/components/dashboard/founder/KanbanBoard';
import type { KanbanCardProps } from '@/components/dashboard/founder/KanbanCard';
import { CandidateCard } from '@/components/dashboard/founder/CandidateCard';
import type { CandidateCardProps } from '@/components/dashboard/founder/CandidateCard';
import { InvestorItem } from '@/components/dashboard/founder/InvestorItem';
import type { InvestorItemProps } from '@/components/dashboard/founder/InvestorItem';
import { ActivityFeed } from '@/components/dashboard/founder/ActivityFeed';
import type { ActivityItem } from '@/components/dashboard/founder/ActivityFeed';

// ─── Freelancer Dashboard ──────────────────────────────────────────────────────

const FREELANCER_METRICS: Metric[] = [
  { label: 'Matches Made', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
  { label: 'Profile Views', value: '—', delta: 0, sparkline: [], fallback: true },
  { label: 'Unread Messages', value: '—', delta: 0, sparkline: [], fallback: true },
];

const MATCH_TABS = [
  { id: 'all', label: 'All matches' },
  { id: 'new', label: 'New', count: 0 },
  { id: 'liked', label: 'Liked' },
  { id: 'passed', label: 'Passed' },
];

function FreelancerDashboard({
  userName,
  profileCompletion,
  defaultAvailable,
}: {
  userName: string;
  profileCompletion: number;
  defaultAvailable?: boolean;
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [inboxItems] = useState<InboxItemProps[]>([]);
  const [matches] = useState<MatchCardProps[]>([]);

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Sidebar — desktop */}
      <aside className="hidden xl:flex flex-col gap-4 w-[380px] flex-shrink-0">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
          <div className="flex flex-col items-center gap-3 mb-4">
            <ProfileRing percent={profileCompletion} label={`Profile ${profileCompletion}% complete`} />
            <div className="text-center">
              <p className="font-semibold text-neutral-900">{userName}</p>
              <p className="text-xs text-neutral-500 mt-0.5">Your profile completion</p>
            </div>
          </div>
          {profileCompletion < 100 && (
            <Link href="/profile/edit">
              <Button variant="secondary" size="sm" className="w-full">
                Complete profile
              </Button>
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
          <AvailabilityToggle defaultAvailable={defaultAvailable} />
        </div>

        {inboxItems.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Inbox</h3>
              <Link href="/inbox" className="text-xs text-primary-600 hover:underline">See all</Link>
            </div>
            <ul className="space-y-2">
              {inboxItems.slice(0, 3).map((item) => (
                <InboxItem key={item.id} {...item} />
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Main column */}
      <main className="flex-1 min-w-0 space-y-5">
        {/* Mobile profile strip */}
        <div className="xl:hidden bg-white rounded-xl border border-neutral-200 shadow-xs p-4 flex items-center gap-3">
          <ProfileRing percent={profileCompletion} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-900 truncate">{userName}</p>
            <p className="text-xs text-neutral-500">{profileCompletion}% profile complete</p>
          </div>
          <AvailabilityToggle defaultAvailable={defaultAvailable} />
        </div>

        {/* Match filter tabs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-neutral-900">Your matches</h2>
            <Link href="/feed" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              See all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <FilterTabs tabs={MATCH_TABS} defaultTab="all" onChange={setActiveTab} />
        </div>

        {/* Match cards grid */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
            <p className="text-sm text-neutral-500 mb-2">No matches yet for &ldquo;{activeTab}&rdquo;</p>
            <Link href="/feed">
              <Button variant="primary" size="sm">Browse feed</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            {matches.map((m) => (
              <MatchCard key={m.id} {...m} />
            ))}
          </div>
        )}

        {/* Payments & Escrow section */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
          <EscrowDashboardTab viewerRole="counterparty" viewerName={userName} />
        </div>
      </main>
    </div>
  );
}

// ─── Founder Dashboard ────────────────────────────────────────────────────────

const FOUNDER_METRICS: Metric[] = [
  { label: 'Matches Found', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
  { label: 'Profile Views', value: '—', delta: 0, sparkline: [], fallback: true },
  { label: 'Investor Reach', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
];

type FounderTab = 'pipeline' | 'candidates' | 'investors' | 'activity' | 'escrow';

function FounderDashboard({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<FounderTab>('pipeline');
  const [kanbanCards] = useState<KanbanCardProps[]>([]);
  const [candidates] = useState<CandidateCardProps[]>([]);
  const [investors] = useState<InvestorItemProps[]>([]);
  const [activityItems] = useState<ActivityItem[]>([]);

  const tabDef: { id: FounderTab; label: string; icon: React.ElementType }[] = [
    { id: 'pipeline', label: 'Pipeline', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'investors', label: 'Investors', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: Inbox },
    { id: 'escrow', label: 'Escrow', icon: Banknote },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Tab bar — all breakpoints */}
      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="flex gap-1 bg-neutral-100 rounded-xl p-1"
      >
        {tabDef.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`founder-panel-${id}`}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
              activeTab === id
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Pipeline panel */}
      <section
        id="founder-panel-pipeline"
        role="tabpanel"
        aria-labelledby="tab-pipeline"
        hidden={activeTab !== 'pipeline'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Candidate pipeline</h2>
        <KanbanBoard initialCards={kanbanCards} />
      </section>

      {/* Candidates panel */}
      <section
        id="founder-panel-candidates"
        role="tabpanel"
        aria-labelledby="tab-candidates"
        hidden={activeTab !== 'candidates'}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Top candidates</h2>
          <Link href="/feed" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {candidates.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
            <p className="text-sm text-neutral-500 mb-2">No candidate matches yet.</p>
            <Link href="/feed"><Button variant="primary" size="sm">Find candidates</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            {candidates.map((c) => <CandidateCard key={c.id} {...c} />)}
          </div>
        )}
      </section>

      {/* Investors panel */}
      <section
        id="founder-panel-investors"
        role="tabpanel"
        aria-labelledby="tab-investors"
        hidden={activeTab !== 'investors'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Matched investors</h2>
        {investors.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
            <p className="text-sm text-neutral-500">No investor matches yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {investors.map((inv) => <InvestorItem key={inv.id} {...inv} />)}
          </ul>
        )}
      </section>

      {/* Activity panel */}
      <section
        id="founder-panel-activity"
        role="tabpanel"
        aria-labelledby="tab-activity"
        hidden={activeTab !== 'activity'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Recent activity</h2>
        <ActivityFeed initialItems={activityItems} />
      </section>

      {/* Escrow panel */}
      <section
        id="founder-panel-escrow"
        role="tabpanel"
        aria-labelledby="tab-escrow"
        hidden={activeTab !== 'escrow'}
      >
        <EscrowDashboardTab viewerRole="founder" viewerName={userName} />
      </section>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface SparklineApiResponse {
  role: string;
  data: { date: string; value: number }[];
  insufficientSample: boolean;
  totals: { matches: number; connections: number; messages: number };
  deltas: { matches: number; connections: number; messages: number };
}

function buildMetrics(role: string, s: SparklineApiResponse): Metric[] {
  const sparkline = s.data.map((p) => p.value);
  if (role === 'founder') {
    return [
      { label: 'Matches Found', value: s.totals.matches, delta: s.deltas.matches, sparkline, aiPowered: true, fallback: false },
      { label: 'Connections', value: s.totals.connections, delta: s.deltas.connections, sparkline, fallback: false },
      { label: 'Messages', value: s.totals.messages, delta: s.deltas.messages, sparkline, fallback: false },
    ];
  }
  if (role === 'investor') {
    return [
      { label: 'Deal Flow', value: s.totals.matches, delta: s.deltas.matches, sparkline, aiPowered: true, fallback: false },
      { label: 'Interests Sent', value: s.totals.connections, delta: s.deltas.connections, sparkline, fallback: false },
      { label: 'Meetings Booked', value: s.totals.messages, delta: s.deltas.messages, sparkline, fallback: false },
    ];
  }
  if (role === 'stakeholder') {
    return [
      { label: 'Introductions', value: s.totals.matches, delta: s.deltas.matches, sparkline, fallback: false },
      { label: 'Connections', value: s.totals.connections, delta: s.deltas.connections, sparkline, fallback: false },
      { label: 'Collaborations', value: s.totals.messages, delta: s.deltas.messages, sparkline, fallback: false },
    ];
  }
  return [
    { label: 'Matches Made', value: s.totals.matches, delta: s.deltas.matches, sparkline, aiPowered: true, fallback: false },
    { label: 'Connections', value: s.totals.connections, delta: s.deltas.connections, sparkline, fallback: false },
    { label: 'Messages', value: s.totals.messages, delta: s.deltas.messages, sparkline, fallback: false },
  ];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string; email?: string } | undefined;
  const userName = user?.name ?? user?.email ?? 'there';
  const userRole = (user?.role as string) ?? 'freelancer';
  const isFounder = userRole === 'founder';
  const isInvestor = userRole === 'investor';
  const isStakeholder = userRole === 'stakeholder';

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<Metric[] | undefined>(undefined);
  const [userAvailable, setUserAvailable] = useState<boolean | undefined>(undefined);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchMetrics() {
      try {
        const r = await fetch('/api/analytics/sparkline?days=14');
        const data: SparklineApiResponse | null = r.ok ? await r.json() : null;
        if (cancelled) return;
        if (data?.totals) setAnalyticsMetrics(buildMetrics(userRole, data));
        setAnalyticsLoading(false);
      } catch {
        if (cancelled) return;
        setAnalyticsLoading(false);
      }
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userRole]);

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data: { available?: boolean; profileCompletion?: number } | null) => {
        if (data?.available !== undefined) setUserAvailable(data.available);
        if (data?.profileCompletion !== undefined) setProfileCompletion(data.profileCompletion);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* AnalyticsBar — sticky below GlobalNav (top: 60px) */}
      <AnalyticsBar
        role={isFounder ? 'founder' : isInvestor ? 'investor' : isStakeholder ? 'stakeholder' : 'freelancer'}
        metrics={analyticsMetrics}
        loading={analyticsLoading}
      />

      {/* Role-specific dashboard body */}
      {isFounder && <FounderDashboard userName={userName} />}
      {isInvestor && <InvestorDashboard userName={userName} />}
      {isStakeholder && <StakeholderDashboard userName={userName} />}
      {!isFounder && !isInvestor && !isStakeholder && (
        <FreelancerDashboard
          userName={userName}
          profileCompletion={profileCompletion}
          defaultAvailable={userAvailable}
        />
      )}
    </div>
  );
}
