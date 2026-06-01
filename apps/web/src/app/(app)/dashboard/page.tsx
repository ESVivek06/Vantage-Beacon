'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Briefcase,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  Bell,
  MapPin,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, initials, roleLabel, roleColor, formatRelative } from '@/lib/utils';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STATS = [
  { label: 'Profile views', value: 47, delta: '+12%', up: true },
  { label: 'Match score avg', value: '82%', delta: '+5pts', up: true },
  { label: 'Active opps', value: 3, delta: null, up: null },
  { label: 'Connections', value: 18, delta: '+2', up: true },
];

const MOCK_TOP_MATCHES = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'founder',
    title: 'CEO @ NovaTech',
    score: 94,
    location: 'London',
    skills: ['React', 'TypeScript', 'Product'],
  },
  {
    id: '2',
    name: "James O'Brien",
    role: 'investor',
    title: 'Partner @ Vertex',
    score: 88,
    location: 'Dublin',
    skills: ['SaaS', 'Series A', 'B2B'],
  },
  {
    id: '3',
    name: 'Aisha Mohammed',
    role: 'freelancer',
    title: 'UX Lead',
    score: 85,
    location: 'Remote',
    skills: ['Figma', 'Research', 'Design Systems'],
  },
  {
    id: '4',
    name: 'Carlos Ruiz',
    role: 'founder',
    title: 'CTO @ DataBridge',
    score: 81,
    location: 'Madrid',
    skills: ['Python', 'ML', 'APIs'],
  },
];

const MOCK_ACTIVITY = [
  {
    id: '1',
    type: 'match',
    message: 'New strong match: Priya Sharma (94%)',
    time: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: '2',
    type: 'connection',
    message: "James O'Brien accepted your connection request",
    time: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '3',
    type: 'view',
    message: '3 people viewed your profile today',
    time: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: '4',
    type: 'opportunity',
    message: 'New opportunity: Senior React Engineer at Acme Corp',
    time: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: '5',
    type: 'message',
    message: 'New message from Aisha Mohammed',
    time: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const MOCK_OPPORTUNITIES = [
  {
    id: '1',
    title: 'Senior Full-Stack Engineer',
    company: 'NovaTech',
    type: 'contract',
    budget: '£500/day',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    urgent: false,
  },
  {
    id: '2',
    title: 'Technical Co-Founder',
    company: 'StealthAI',
    type: 'equity',
    budget: '2–5% equity',
    skills: ['Python', 'ML', 'Leadership'],
    urgent: false,
  },
  {
    id: '3',
    title: 'Frontend Lead',
    company: 'FinFlow',
    type: 'full-time',
    budget: '£90–110k',
    skills: ['TypeScript', 'Next.js', 'Design Systems'],
    urgent: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const color =
    score >= 85 ? '#16A34A' : score >= 65 ? '#D97706' : '#14B8A6';
  return (
    <div
      className="flex items-center justify-center w-10 h-10 rounded-full"
      style={{ background: `conic-gradient(${color} ${score}%, #e2e8f0 0)` }}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-neutral-800 text-xs font-semibold">
        {score}
      </span>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ReactNode; bg: string }> = {
    match: { icon: <Star className="h-3.5 w-3.5" />, bg: 'bg-primary-100 text-primary-600' },
    connection: { icon: <Users className="h-3.5 w-3.5" />, bg: 'bg-success-100 text-success-600' },
    view: { icon: <TrendingUp className="h-3.5 w-3.5" />, bg: 'bg-secondary-100 text-secondary-600' },
    opportunity: { icon: <Briefcase className="h-3.5 w-3.5" />, bg: 'bg-accent-100 text-accent-600' },
    message: { icon: <Zap className="h-3.5 w-3.5" />, bg: 'bg-neutral-100 text-neutral-600' },
  };
  const { icon, bg } = map[type] ?? map.message;
  return (
    <span className={cn('flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0', bg)}>
      {icon}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string; email?: string } | undefined;
  const userName = user?.name ?? user?.email ?? 'there';
  const userRole = (user?.role as string) ?? 'freelancer';
  const [activeMobileTab, setActiveMobileTab] = useState<'overview' | 'matches' | 'opportunities'>('overview');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile role-switcher bar */}
      <div className="md:hidden flex border-b border-neutral-200 bg-white sticky top-14 z-10">
        {(['overview', 'matches', 'opportunities'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveMobileTab(tab)}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium capitalize transition-colors',
              activeMobileTab === tab
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-neutral-500',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* Left sidebar — 280px, desktop only */}
          <aside className="hidden md:flex flex-col gap-4 w-[280px] flex-shrink-0">

            {/* Profile summary */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  {initials(userName)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{userName}</p>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5',
                      roleColor(userRole),
                    )}
                  >
                    {roleLabel(userRole)}
                  </span>
                </div>
              </div>
              <Link href="/profile/me">
                <Button variant="secondary" size="sm" className="w-full">
                  View profile
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Your stats
              </h3>
              <div className="space-y-3">
                {MOCK_STATS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">{s.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-neutral-900">{s.value}</span>
                      {s.delta && (
                        <span
                          className={cn(
                            'text-xs font-medium',
                            s.up ? 'text-success-600' : 'text-error-600',
                          )}
                        >
                          {s.delta}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active opportunities panel */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  My opportunities
                </h3>
                <Link href="/opportunities" className="text-xs text-primary-600 hover:underline">
                  See all
                </Link>
              </div>
              <div className="space-y-2">
                {MOCK_OPPORTUNITIES.map((o) => (
                  <Link
                    key={o.id}
                    href="/opportunities"
                    className="block p-2.5 rounded-lg hover:bg-neutral-50 transition-colors border border-neutral-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-800 leading-tight">{o.title}</p>
                      {o.urgent && (
                        <Badge variant="warning" className="text-xs flex-shrink-0">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{o.company}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main column */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* Welcome banner */}
            <div
              className="rounded-xl p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #14B8A6 100%)',
              }}
            >
              <p className="text-sm font-medium text-white/80 mb-1">{greeting},</p>
              <h1 className="text-2xl font-bold mb-3">{userName.split(' ')[0]}</h1>
              <p className="text-sm text-white/80 mb-4">
                You have <strong className="text-white">4 new matches</strong> and{' '}
                <strong className="text-white">2 unread messages</strong> since your last visit.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/feed">
                  <Button size="sm" className="bg-white text-primary-600 hover:bg-white/90">
                    View matches
                  </Button>
                </Link>
                <Link href="/inbox">
                  <Button
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 border border-white/30"
                  >
                    Open inbox
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile compact profile bar + stats row */}
            <div className="md:hidden bg-white rounded-xl border border-neutral-200 shadow-xs p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  {initials(userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 text-sm truncate">{userName}</p>
                  <span
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                      roleColor(userRole),
                    )}
                  >
                    {roleLabel(userRole)}
                  </span>
                </div>
                <Link href="/profile/me">
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-neutral-100">
                {MOCK_STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-base font-bold text-neutral-900">{s.value}</p>
                    <p className="text-xs text-neutral-500 leading-tight mt-0.5">
                      {s.label.split(' ')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top matches — horizontal scroll */}
            <div
              className={cn(
                activeMobileTab === 'overview' || activeMobileTab === 'matches'
                  ? 'block'
                  : 'hidden md:block',
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-neutral-900">Top matches for you</h2>
                <Link
                  href="/feed"
                  className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                >
                  See all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
                {MOCK_TOP_MATCHES.map((m) => (
                  <Link
                    key={m.id}
                    href={`/profile/${m.id}`}
                    className="flex-shrink-0 w-[200px] snap-start bg-white rounded-xl border border-neutral-200 shadow-xs p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-normal"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                      >
                        {initials(m.name)}
                      </div>
                      <ScoreArc score={m.score} />
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 truncate">{m.name}</p>
                    <p className="text-xs text-neutral-500 truncate mb-2">{m.title}</p>
                    <div className="flex items-center gap-1 text-xs text-neutral-400 mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{m.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.skills.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded-sm bg-primary-50 text-primary-700 text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div
              className={cn(activeMobileTab === 'overview' ? 'block' : 'hidden md:block')}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-neutral-900">Recent activity</h2>
                <button className="text-sm text-neutral-400 hover:text-neutral-600" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </button>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 shadow-xs divide-y divide-neutral-100">
                {MOCK_ACTIVITY.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-4">
                    <ActivityIcon type={a.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800">{a.message}</p>
                    </div>
                    <span className="text-xs text-neutral-400 flex-shrink-0">
                      {formatRelative(a.time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested opportunities */}
            <div
              className={cn(
                activeMobileTab === 'overview' || activeMobileTab === 'opportunities'
                  ? 'block'
                  : 'hidden md:block',
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-neutral-900">Suggested opportunities</h2>
                <Link
                  href="/opportunities"
                  className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                >
                  Browse all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {MOCK_OPPORTUNITIES.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 hover:shadow-md transition-shadow"
                    style={{
                      borderLeft: `4px solid ${o.urgent ? '#F59E0B' : '#4F46E5'}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-neutral-900">{o.title}</h3>
                          {o.urgent && <Badge variant="warning" className="text-xs">Urgent</Badge>}
                        </div>
                        <p className="text-xs text-neutral-500 mb-2">
                          {o.company} · {o.type} · {o.budget}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {o.skills.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-600 text-xs"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" className="flex-shrink-0">
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
