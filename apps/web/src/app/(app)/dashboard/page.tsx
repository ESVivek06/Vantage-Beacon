'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ChevronRight,
  LayoutDashboard,
  Users,
  Inbox,
  TrendingUp,
  Banknote,
  DollarSign,
  Briefcase,
  Star,
  Bell,
} from 'lucide-react';
import { EscrowDashboardTab } from '@/components/escrow/EscrowDashboardTab';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Shared
import { AnalyticsBar } from '@/components/dashboard/AnalyticsBar';
import type { Metric } from '@/components/dashboard/AnalyticsBar';

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

// ─── Welcome Banner ────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  freelancer: 'Freelancer',
  founder: 'Founder',
  investor: 'Investor',
  supplier: 'Supplier',
};

function WelcomeBanner({ userName, role }: { userName: string; role: string }) {
  const label = ROLE_LABELS[role] ?? 'Member';
  return (
    <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white">
      <p className="text-sm font-medium text-primary-200">Welcome back</p>
      <h1 className="mt-0.5 text-xl font-bold">{userName}</h1>
      <p className="mt-1 text-sm text-primary-100">{label} Dashboard</p>
    </div>
  );
}

// ─── Freelancer Dashboard ──────────────────────────────────────────────────────

const FREELANCER_METRICS: Metric[] = [
  { label: 'Matches Made', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
  { label: 'Profile Views', value: '—', delta: 0, sparkline: [], fallback: true },
  { label: 'Messages Sent', value: '—', delta: 0, sparkline: [], fallback: true },
];

const MATCH_TABS = [
  { id: 'all', label: 'All matches' },
  { id: 'new', label: 'New', count: 0 },
  { id: 'liked', label: 'Liked' },
  { id: 'passed', label: 'Passed' },
];

const FREELANCER_ACTIVITY: ActivityItem[] = [
  {
    id: 'fa1',
    type: 'match',
    title: 'New match suggestion',
    description: 'AI found 3 new startup matches for your profile.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    actionRequired: false,
  },
  {
    id: 'fa2',
    type: 'view',
    title: 'Profile viewed',
    description: 'Your profile was viewed 2 times today.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
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
      {/* Sidebar — desktop only (280px) */}
      <aside className="hidden xl:flex flex-col gap-4 w-[280px] flex-shrink-0">
        {/* Profile ring card */}
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

        {/* Availability toggle */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
          <AvailabilityToggle defaultAvailable={defaultAvailable} />
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Activity</h3>
            <Link href="/notifications" className="text-xs text-primary-600 hover:underline">
              See all
            </Link>
          </div>
          <ActivityFeed initialItems={FREELANCER_ACTIVITY} />
        </div>

        {/* Inbox preview */}
        {inboxItems.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Inbox</h3>
              <Link href="/inbox" className="text-xs text-primary-600 hover:underline">
                See all
              </Link>
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
        {/* Welcome banner */}
        <WelcomeBanner userName={userName} role="freelancer" />

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
            <Link href="/discover" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              Browse all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <FilterTabs tabs={MATCH_TABS} defaultTab="all" onChange={setActiveTab} />
        </div>

        {/* Match cards — scrollable container */}
        <div className="overflow-y-auto max-h-[520px] pr-1">
          {matches.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
              <p className="text-sm text-neutral-500 mb-2">No matches yet for &ldquo;{activeTab}&rdquo;</p>
              <Link href="/discover">
                <Button variant="primary" size="sm">Discover matches</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
              {matches.map((m) => (
                <MatchCard key={m.id} {...m} />
              ))}
            </div>
          )}
        </div>

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
      {/* Welcome banner */}
      <WelcomeBanner userName={userName} role="founder" />

      {/* Tab bar */}
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
          <Link href="/discover/talent" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            Find talent <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {candidates.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
            <p className="text-sm text-neutral-500 mb-2">No candidate matches yet.</p>
            <Link href="/discover/talent">
              <Button variant="primary" size="sm">Find candidates</Button>
            </Link>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Matched investors</h2>
          <Link href="/discover" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            Explore <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
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

// ─── Investor Dashboard ───────────────────────────────────────────────────────

const INVESTOR_METRICS: Metric[] = [
  { label: 'Deal Flow', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
  { label: 'Portfolio Cos.', value: '—', delta: 0, sparkline: [], fallback: true },
  { label: 'Avg Match Score', value: '—', delta: 0, sparkline: [], aiPowered: true, fallback: true },
];

const INVESTOR_SAMPLE_ACTIVITY: ActivityItem[] = [
  {
    id: 'ia1',
    type: 'match',
    title: 'New startup match',
    description: 'AI matched 2 early-stage startups in your focus sector.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    actionRequired: true,
  },
  {
    id: 'ia2',
    type: 'connection',
    title: 'Connection request',
    description: 'A founder wants to connect with you.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    actionRequired: true,
  },
];

type InvestorTab = 'matches' | 'pipeline' | 'activity' | 'escrow';

function InvestorDashboard({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<InvestorTab>('matches');
  const [startupMatches] = useState<MatchCardProps[]>([]);
  const [activityItems] = useState<ActivityItem[]>(INVESTOR_SAMPLE_ACTIVITY);

  const tabDef: { id: InvestorTab; label: string; icon: React.ElementType }[] = [
    { id: 'matches', label: 'Startup Matches', icon: Star },
    { id: 'pipeline', label: 'Due Diligence', icon: LayoutDashboard },
    { id: 'activity', label: 'Activity', icon: Bell },
    { id: 'escrow', label: 'Payments', icon: DollarSign },
  ];

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Sidebar — desktop only (280px) */}
      <aside className="hidden xl:flex flex-col gap-4 w-[280px] flex-shrink-0">
        {/* Investment KPI snapshot */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Portfolio</h3>
          {[
            { label: 'Portfolio Companies', value: '—' },
            { label: 'Active Deals', value: '—' },
            { label: 'Check Size', value: '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-neutral-500">{label}</span>
              <span className="font-semibold text-neutral-300">{value}</span>
            </div>
          ))}
          <Link href="/profile/edit">
            <Button variant="secondary" size="sm" className="w-full mt-2">
              Update investment profile
            </Button>
          </Link>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 space-y-2">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Quick access</h3>
          {[
            { label: 'Discover startups', href: '/discover/startups' },
            { label: 'My connections', href: '/connections' },
            { label: 'Messages', href: '/inbox' },
            { label: 'Settings', href: '/settings' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between text-sm text-neutral-700 hover:text-primary-600 py-1 transition-colors"
            >
              {label}
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            </Link>
          ))}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Activity</h3>
            <Link href="/notifications" className="text-xs text-primary-600 hover:underline">
              See all
            </Link>
          </div>
          <ActivityFeed initialItems={activityItems} />
        </div>
      </aside>

      {/* Main column */}
      <main className="flex-1 min-w-0 space-y-5">
        {/* Welcome banner */}
        <WelcomeBanner userName={userName} role="investor" />

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Investor dashboard sections"
          className="flex gap-1 bg-neutral-100 rounded-xl p-1"
        >
          {tabDef.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`investor-panel-${id}`}
              onClick={() => setActiveTab(id as InvestorTab)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
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

        {/* Startup matches panel */}
        <section
          id="investor-panel-matches"
          role="tabpanel"
          hidden={activeTab !== 'matches'}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-neutral-900">AI-matched startups</h2>
            <Link href="/discover/startups" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              Browse all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-y-auto max-h-[520px] pr-1">
            {startupMatches.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
                <p className="text-sm text-neutral-500 mb-4">
                  Complete your investment profile to see AI-curated startup matches.
                </p>
                <Link href="/profile/edit">
                  <Button variant="primary" size="sm">Complete profile</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                {startupMatches.map((m) => <MatchCard key={m.id} {...m} />)}
              </div>
            )}
          </div>
        </section>

        {/* Due diligence pipeline */}
        <section
          id="investor-panel-pipeline"
          role="tabpanel"
          hidden={activeTab !== 'pipeline'}
        >
          <h2 className="text-base font-semibold text-neutral-900 mb-4">Due diligence pipeline</h2>
          <KanbanBoard initialCards={[]} />
        </section>

        {/* Activity panel */}
        <section
          id="investor-panel-activity"
          role="tabpanel"
          hidden={activeTab !== 'activity'}
        >
          <h2 className="text-base font-semibold text-neutral-900 mb-4">Recent activity</h2>
          <ActivityFeed initialItems={activityItems} />
        </section>

        {/* Payments panel */}
        <section
          id="investor-panel-escrow"
          role="tabpanel"
          hidden={activeTab !== 'escrow'}
        >
          <EscrowDashboardTab viewerRole="counterparty" viewerName={userName} />
        </section>
      </main>
    </div>
  );
}

// ─── Supplier Dashboard ───────────────────────────────────────────────────────

const SUPPLIER_METRICS: Metric[] = [
  { label: 'Enquiries', value: '—', delta: 0, sparkline: [], fallback: true },
  { label: 'Active Projects', value: '—', delta: 0, sparkline: [], fallback: true },
  { label: 'Revenue', value: '—', delta: 0, sparkline: [], fallback: true },
];

const SUPPLIER_ACTIVITY: ActivityItem[] = [
  {
    id: 'sa1',
    type: 'connection',
    title: 'New project enquiry',
    description: 'A startup has sent you a service enquiry.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    actionRequired: true,
  },
  {
    id: 'sa2',
    type: 'view',
    title: 'Service listing viewed',
    description: 'Your services were viewed 4 times today.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

type SupplierTab = 'enquiries' | 'projects' | 'activity' | 'escrow';

function SupplierDashboard({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<SupplierTab>('enquiries');
  const [enquiries] = useState<MatchCardProps[]>([]);
  const [activityItems] = useState<ActivityItem[]>(SUPPLIER_ACTIVITY);

  const tabDef: { id: SupplierTab; label: string; icon: React.ElementType }[] = [
    { id: 'enquiries', label: 'Enquiries', icon: Inbox },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'activity', label: 'Activity', icon: Bell },
    { id: 'escrow', label: 'Payments', icon: DollarSign },
  ];

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Sidebar — desktop only (280px) */}
      <aside className="hidden xl:flex flex-col gap-4 w-[280px] flex-shrink-0">
        {/* Service KPIs */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Services</h3>
          {[
            { label: 'Listed Services', value: '—' },
            { label: 'Completion Rate', value: '—' },
            { label: 'Avg Response Time', value: '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-neutral-500">{label}</span>
              <span className="font-semibold text-neutral-300">{value}</span>
            </div>
          ))}
          <Link href="/opportunities/new">
            <Button variant="secondary" size="sm" className="w-full mt-2">
              List a service
            </Button>
          </Link>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 space-y-2">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Quick access</h3>
          {[
            { label: 'My opportunities', href: '/opportunities' },
            { label: 'Connections', href: '/connections' },
            { label: 'Messages', href: '/inbox' },
            { label: 'Settings', href: '/settings' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between text-sm text-neutral-700 hover:text-primary-600 py-1 transition-colors"
            >
              {label}
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            </Link>
          ))}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Activity</h3>
            <Link href="/notifications" className="text-xs text-primary-600 hover:underline">
              See all
            </Link>
          </div>
          <ActivityFeed initialItems={activityItems} />
        </div>
      </aside>

      {/* Main column */}
      <main className="flex-1 min-w-0 space-y-5">
        {/* Welcome banner */}
        <WelcomeBanner userName={userName} role="supplier" />

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Supplier dashboard sections"
          className="flex gap-1 bg-neutral-100 rounded-xl p-1"
        >
          {tabDef.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`supplier-panel-${id}`}
              onClick={() => setActiveTab(id as SupplierTab)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
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

        {/* Enquiries panel */}
        <section
          id="supplier-panel-enquiries"
          role="tabpanel"
          hidden={activeTab !== 'enquiries'}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-neutral-900">Project enquiries</h2>
            <Link href="/discover" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              Browse startups <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-y-auto max-h-[520px] pr-1">
            {enquiries.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
                <p className="text-sm text-neutral-500 mb-4">
                  No enquiries yet. List your services to start receiving project requests.
                </p>
                <Link href="/opportunities/new">
                  <Button variant="primary" size="sm">List a service</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                {enquiries.map((m) => <MatchCard key={m.id} {...m} />)}
              </div>
            )}
          </div>
        </section>

        {/* Projects panel */}
        <section
          id="supplier-panel-projects"
          role="tabpanel"
          hidden={activeTab !== 'projects'}
        >
          <h2 className="text-base font-semibold text-neutral-900 mb-4">Active projects</h2>
          <KanbanBoard initialCards={[]} />
        </section>

        {/* Activity panel */}
        <section
          id="supplier-panel-activity"
          role="tabpanel"
          hidden={activeTab !== 'activity'}
        >
          <h2 className="text-base font-semibold text-neutral-900 mb-4">Recent activity</h2>
          <ActivityFeed initialItems={activityItems} />
        </section>

        {/* Escrow panel */}
        <section
          id="supplier-panel-escrow"
          role="tabpanel"
          hidden={activeTab !== 'escrow'}
        >
          <EscrowDashboardTab viewerRole="counterparty" viewerName={userName} />
        </section>
      </main>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string; email?: string } | undefined;
  const userName = user?.name ?? user?.email ?? 'there';
  const userRole = (user?.role as string) ?? 'freelancer';

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<Metric[] | undefined>(undefined);
  const [userAvailable, setUserAvailable] = useState<boolean | undefined>(undefined);
  const [profileCompletion, setProfileCompletion] = useState(0);

  const roleMetrics: Record<string, Metric[]> = {
    freelancer: FREELANCER_METRICS,
    founder: FOUNDER_METRICS,
    investor: INVESTOR_METRICS,
    supplier: SUPPLIER_METRICS,
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setAnalyticsLoading(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.available !== undefined) setUserAvailable(data.available);
        if (typeof data?.profileCompletion === 'number') {
          setProfileCompletion(data.profileCompletion);
        } else {
          setProfileCompletion(50);
        }
      })
      .catch(() => { setProfileCompletion(50); });
  }, []);

  const metrics = analyticsMetrics ?? roleMetrics[userRole] ?? FREELANCER_METRICS;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* AnalyticsBar — below GlobalNav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnalyticsBar
          role={userRole === 'founder' ? 'founder' : 'freelancer'}
          metrics={metrics}
          loading={analyticsLoading}
        />
      </div>

      {/* Role-specific dashboard body */}
      {userRole === 'founder' ? (
        <FounderDashboard userName={userName} />
      ) : userRole === 'investor' ? (
        <InvestorDashboard userName={userName} />
      ) : userRole === 'supplier' ? (
        <SupplierDashboard userName={userName} />
      ) : (
        <FreelancerDashboard
          userName={userName}
          profileCompletion={profileCompletion}
          defaultAvailable={userAvailable}
        />
      )}
    </div>
  );
}
