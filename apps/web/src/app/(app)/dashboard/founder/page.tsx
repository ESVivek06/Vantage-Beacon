'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronRight, Users, TrendingUp, DollarSign, Milestone } from 'lucide-react';
import Link from 'next/link';
import { AnalyticsBar } from '@/components/dashboard/AnalyticsBar';
import { KanbanBoard } from '@/components/dashboard/founder/KanbanBoard';
import { CandidateCard } from '@/components/dashboard/founder/CandidateCard';
import { InvestorItem } from '@/components/dashboard/founder/InvestorItem';
import { ActivityFeed } from '@/components/dashboard/founder/ActivityFeed';
import { StartupSnapshot } from '@/components/dashboard/founder/StartupSnapshot';
import { cn } from '@/lib/utils';
import type { KanbanCardProps } from '@/components/dashboard/founder/KanbanCard';
import type { ActivityItem } from '@/components/dashboard/founder/ActivityFeed';
import type { InvestorItemProps } from '@/components/dashboard/founder/InvestorItem';
import type { CandidateCardProps } from '@/components/dashboard/founder/CandidateCard';

type MobileTab = 'overview' | 'pipeline' | 'investors';

const SAMPLE_KANBAN_CARDS: KanbanCardProps[] = [
  { id: 'k1', name: 'Build MVP', title: 'Engineering', status: 'in-progress', fitScore: 85 },
  { id: 'k2', name: 'Pitch Deck', title: 'Marketing', status: 'review', fitScore: 72 },
  { id: 'k3', name: 'Market Research', title: 'Strategy', status: 'done' },
  { id: 'k4', name: 'Team Hiring', title: 'Operations', status: 'backlog' },
];

const SAMPLE_CANDIDATES: CandidateCardProps[] = [
  {
    id: 'cand1',
    name: 'Sarah Chen',
    title: 'Full-Stack Engineer',
    location: 'London, UK',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    fitScore: 91,
    fitScoreFallback: false,
  },
  {
    id: 'cand2',
    name: 'Marcus Williams',
    title: 'Product Designer',
    location: 'Manchester, UK',
    skills: ['Figma', 'UX Research', 'Prototyping'],
    fitScore: 78,
    fitScoreFallback: false,
  },
];

const SAMPLE_INVESTORS: InvestorItemProps[] = [
  {
    id: 'inv1',
    name: 'Priya Patel',
    firm: 'Acorn Ventures',
    fundStage: 'Seed',
    checkSize: '50k–500k',
    rank: 1,
    rankFallback: false,
  },
  {
    id: 'inv2',
    name: 'James O\'Brien',
    firm: 'Northern Light Capital',
    fundStage: 'Series A',
    checkSize: '500k–2M',
    rank: 2,
    rankFallback: false,
  },
];

const SAMPLE_ACTIVITY: ActivityItem[] = [
  {
    id: 'act1',
    type: 'connection',
    title: 'New connection request',
    description: 'Sarah Chen wants to connect with your startup.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    personName: 'Sarah Chen',
    actionRequired: true,
  },
  {
    id: 'act2',
    type: 'match',
    title: 'New investor match',
    description: 'Priya Patel matches your funding stage and sector.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'act3',
    type: 'view',
    title: 'Profile viewed',
    description: 'Your startup profile was viewed 3 times today.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export default function FounderDashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string } | undefined;
  const userName = user?.name ?? user?.email ?? 'there';
  const [mobileTab, setMobileTab] = useState<MobileTab>('overview');

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    ? `${process.env.NEXT_PUBLIC_WS_URL}/activity`
    : undefined;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile bottom tabbar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-neutral-200 flex">
        {([
          { id: 'overview', label: 'Overview', Icon: TrendingUp },
          { id: 'pipeline', label: 'Pipeline', Icon: Milestone },
          { id: 'investors', label: 'Investors', Icon: DollarSign },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setMobileTab(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
              mobileTab === id ? 'text-primary-600' : 'text-neutral-500',
            )}
            aria-pressed={mobileTab === id}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {/* AnalyticsBar — full width above content */}
        <div className="mb-6">
          <AnalyticsBar role="founder" />
        </div>

        {/* StartupSnapshot — KPI row */}
        <div
          className={cn(
            'mb-6',
            mobileTab !== 'overview' && 'hidden md:block',
          )}
        >
          <StartupSnapshot />
        </div>

        {/* 2-col layout: main (1fr) + sidebar (380px) */}
        <div className="flex gap-6 items-start">
          {/* ── Main column ── */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Team Builder — Candidate cards */}
            <section
              className={cn(
                mobileTab !== 'overview' && mobileTab !== 'pipeline' ? 'hidden md:block' : undefined,
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary-600" aria-hidden="true" />
                  Team Builder
                </h2>
                <Link
                  href="/discover"
                  className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                >
                  Find more <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SAMPLE_CANDIDATES.map((c) => (
                  <CandidateCard key={c.id} {...c} />
                ))}
              </div>
            </section>

            {/* Milestone Tracker — KanbanBoard */}
            <section
              className={cn(
                mobileTab !== 'overview' && mobileTab !== 'pipeline' ? 'hidden md:block' : undefined,
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <Milestone className="h-4 w-4 text-primary-600" aria-hidden="true" />
                  Milestone Tracker
                </h2>
              </div>
              <KanbanBoard initialCards={SAMPLE_KANBAN_CARDS} />
            </section>
          </main>

          {/* ── Sidebar (380px, desktop only) ── */}
          <aside
            className={cn(
              'hidden xl:flex flex-col gap-4 shrink-0',
              'w-[380px]',
            )}
          >
            {/* Investor Connections */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary-600" aria-hidden="true" />
                  Investor Connections
                </h2>
                <Link
                  href="/discover"
                  className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                >
                  See all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul className="space-y-2">
                {SAMPLE_INVESTORS.map((inv) => (
                  <InvestorItem key={inv.id} {...inv} />
                ))}
              </ul>
            </section>

            {/* Activity Feed */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-neutral-900">Activity</h2>
              </div>
              <ActivityFeed
                initialItems={SAMPLE_ACTIVITY}
                wsUrl={wsUrl}
              />
            </section>
          </aside>

          {/* Mobile: investors tab */}
          {mobileTab === 'investors' && (
            <div className="xl:hidden flex-1 min-w-0 space-y-6">
              <section>
                <h2 className="text-base font-semibold text-neutral-900 mb-3">Investor Connections</h2>
                <ul className="space-y-2">
                  {SAMPLE_INVESTORS.map((inv) => (
                    <InvestorItem key={inv.id} {...inv} />
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-base font-semibold text-neutral-900 mb-3">Activity</h2>
                <ActivityFeed initialItems={SAMPLE_ACTIVITY} wsUrl={wsUrl} />
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
