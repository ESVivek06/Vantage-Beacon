'use client';

import { useState } from 'react';
import { Activity, Link2, Users, Settings, Sparkles, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';

type StakeholderTab = 'overview' | 'engagement' | 'matches' | 'settings';
type StakeholderRole = 'advisor' | 'mentor' | 'corporate';

const TAB_DEF: { id: StakeholderTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'engagement', label: 'Engagement', icon: Link2 },
  { id: 'matches', label: 'Matches', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ROLE_OPTIONS: { value: StakeholderRole; label: string; description: string }[] = [
  { value: 'advisor', label: 'Advisor', description: 'Domain expertise and strategic advice' },
  { value: 'mentor', label: 'Mentor', description: 'Guidance and personal support' },
  { value: 'corporate', label: 'Corporate / Institution', description: 'Partnerships and corporate programmes' },
];

interface ActivityItemData {
  id: string;
  type: 'match' | 'accepted' | 'new_match';
  message: string;
  time: string;
}

interface RelevantMatch {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  photoUrl?: string;
}

interface EngagementConnection {
  id: string;
  name: string;
  role: string;
  detail: string;
  connectedAt: string;
  collaborating?: boolean;
  photoUrl?: string;
}

interface Introduction {
  id: string;
  fromName: string;
  fromRole: string;
  toName: string;
  toRole: string;
  status: 'accepted' | 'pending' | 'declined';
  madeAt: string;
}

interface PlatformStats {
  membersInNetwork: number;
  liveDeals: number;
}

// Activity feed
function ActivityFeedItem({ item }: { item: ActivityItemData }) {
  const iconMap = {
    match: <Sparkles className="h-3.5 w-3.5 text-secondary-500" aria-hidden="true" />,
    accepted: <CheckCircle2 className="h-3.5 w-3.5 text-success-600" aria-hidden="true" />,
    new_match: <TrendingUp className="h-3.5 w-3.5 text-primary-500" aria-hidden="true" />,
  };

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 last:border-0">
      <div className="mt-0.5 shrink-0">{iconMap[item.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-700">{item.message}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{item.time}</p>
      </div>
    </div>
  );
}

// Relevant match item
function MatchListItem({ match, onConnect }: { match: RelevantMatch; onConnect: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-colors">
      <Avatar className="h-8 w-8 shrink-0">
        {match.photoUrl && <AvatarImage src={match.photoUrl} alt={match.name} />}
        <AvatarFallback className="text-xs font-semibold bg-primary-100 text-primary-700">
          {initials(match.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate">{match.name}</p>
        <p className="text-xs text-neutral-500">{match.role}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-primary-600 font-medium">{match.matchScore}%</span>
        <Button variant="secondary" size="sm" onClick={() => onConnect(match.id)}>Connect</Button>
      </div>
    </div>
  );
}

// Introduction item
function IntroductionItem({ intro }: { intro: Introduction }) {
  const statusConfig = {
    accepted: { label: 'Accepted', className: 'bg-success-100 text-success-700' },
    pending: { label: 'Pending', className: 'bg-warning-100 text-warning-700' },
    declined: { label: 'Declined', className: 'bg-error-100 text-error-600' },
  };
  const { label, className } = statusConfig[intro.status];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-neutral-900">{intro.fromName}</span>
        <span className="text-xs text-neutral-400">({intro.fromRole})</span>
        <ArrowRight className="h-3.5 w-3.5 text-neutral-300" aria-hidden="true" />
        <span className="text-sm font-medium text-neutral-900">{intro.toName}</span>
        <span className="text-xs text-neutral-400">({intro.toRole})</span>
        <span className={cn('ml-auto text-xs font-medium px-2 py-0.5 rounded-full shrink-0', className)}>
          {label}
        </span>
      </div>
      <p className="text-xs text-neutral-400">Made {intro.madeAt}</p>
    </div>
  );
}

// Overview panel
function OverviewPanel({
  activityItems,
  relevantMatches,
  platformStats,
  onConnect,
}: {
  activityItems: ActivityItemData[];
  relevantMatches: RelevantMatch[];
  platformStats: PlatformStats;
  onConnect: (id: string) => void;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      {/* Activity feed */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Activity</h3>
        {activityItems.length === 0 ? (
          <p className="text-sm text-neutral-400 py-4 text-center">No recent activity.</p>
        ) : (
          <>
            {activityItems.slice(0, 8).map((item) => (
              <ActivityFeedItem key={item.id} item={item} />
            ))}
            {activityItems.length > 8 && (
              <button className="text-xs text-primary-600 hover:underline mt-3 block">
                See all activity →
              </button>
            )}
          </>
        )}
      </div>

      {/* Right column: stats + matches */}
      <div className="space-y-4">
        {/* Platform stats */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-neutral-900">{platformStats.membersInNetwork}</p>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mt-0.5">In Network</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{platformStats.liveDeals}</p>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mt-0.5">Live Deals</p>
          </div>
        </div>

        {/* Relevant matches */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Relevant Matches</h3>
          {relevantMatches.length === 0 ? (
            <p className="text-xs text-neutral-400 py-3 text-center">No matches yet.</p>
          ) : (
            <div className="space-y-2">
              {relevantMatches.slice(0, 3).map((m) => (
                <MatchListItem key={m.id} match={m} onConnect={onConnect} />
              ))}
              <button className="text-xs text-primary-600 hover:underline block mt-2">
                Browse all matches →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Engagement panel
function EngagementPanel({
  connections,
  introductions,
}: {
  connections: EngagementConnection[];
  introductions: Introduction[];
}) {
  const collabCount = connections.filter((c) => c.collaborating).length;
  const introCount = introductions.length;

  return (
    <div className="space-y-5">
      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Connections', value: connections.length, color: 'text-primary-700' },
          { label: 'Collaborations', value: collabCount, color: 'text-success-600' },
          { label: 'Introductions', value: introCount, color: 'text-warning-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 shadow-xs px-4 py-3 min-w-[120px]">
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Connections */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Connections</h3>
        {connections.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-8 text-center">
            <p className="text-sm text-neutral-400">No connections yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {connections.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-3 items-start">
                <Avatar className="h-10 w-10 shrink-0">
                  {c.photoUrl && <AvatarImage src={c.photoUrl} alt={c.name} />}
                  <AvatarFallback className="bg-neutral-100 text-neutral-600 text-sm font-semibold">
                    {initials(c.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{c.name}</p>
                      <p className="text-xs text-neutral-500">{c.role} · {c.detail}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Connected {c.connectedAt}</p>
                    </div>
                    {c.collaborating && (
                      <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-success-100 text-success-700">
                        Collaborating
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="secondary" size="sm">Message</Button>
                    <Button variant="ghost" size="sm">View profile</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Introductions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-900">Introductions Made</h3>
          {introductions.length > 3 && (
            <button className="text-xs text-primary-600 hover:underline">View all</button>
          )}
        </div>
        {introductions.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-8 text-center">
            <p className="text-sm text-neutral-400">No introductions yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {introductions.slice(0, 5).map((i) => <IntroductionItem key={i.id} intro={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// Settings panel
function SettingsPanel({
  role,
  onRoleChange,
}: {
  role: StakeholderRole;
  onRoleChange: (r: StakeholderRole) => void;
}) {
  const [domains, setDomains] = useState<string[]>(['Fintech', 'SaaS']);
  const [domainInput, setDomainInput] = useState('');
  const [saved, setSaved] = useState(false);

  function addDomain() {
    if (domainInput.trim() && domains.length < 6 && !domains.includes(domainInput.trim())) {
      setDomains([...domains, domainInput.trim()]);
      setDomainInput('');
    }
  }

  function removeDomain(d: string) {
    setDomains(domains.filter((x) => x !== d));
  }

  async function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5 max-w-lg">
      {/* Role selection */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
          My Stakeholder Role
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ROLE_OPTIONS.map(({ value, label, description }) => (
            <label
              key={value}
              className={cn(
                'flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-colors',
                role === value
                  ? 'bg-warning-50 border-warning-300 ring-1 ring-warning-300'
                  : 'bg-white border-neutral-200 hover:border-neutral-300',
              )}
            >
              <input
                type="radio"
                name="stakeholderRole"
                value={value}
                checked={role === value}
                onChange={() => onRoleChange(value)}
                className="sr-only"
              />
              <span className={cn('text-sm font-medium', role === value ? 'text-warning-800' : 'text-neutral-900')}>
                {label}
              </span>
              <span className="text-xs text-neutral-500">{description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
          {role === 'advisor' ? 'Advisor' : role === 'mentor' ? 'Mentor' : 'Corporate'} Preferences
        </h3>

        {/* Domain expertise */}
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">Domain expertise</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {domains.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200"
              >
                {d}
                <button
                  onClick={() => removeDomain(d)}
                  className="hover:text-primary-900 transition-colors"
                  aria-label={`Remove ${d}`}
                >
                  ×
                </button>
              </span>
            ))}
            {domains.length < 6 && (
              <form
                onSubmit={(e) => { e.preventDefault(); addDomain(); }}
                className="inline-flex items-center gap-1"
              >
                <input
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="+ Add domain"
                  className="text-xs border border-dashed border-neutral-300 rounded-full px-2.5 py-0.5 focus:outline-none focus:border-primary-400 w-24"
                />
              </form>
            )}
          </div>
        </div>

        {/* Stage interest */}
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">Stage interest</label>
          <div className="flex flex-wrap gap-2">
            {(['Pre-seed', 'Seed', 'Series A+', 'Growth'] as const).map((stage) => (
              <label key={stage} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked={stage === 'Pre-seed' || stage === 'Seed'} className="rounded" />
                <span className="text-sm text-neutral-700">{stage}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Who can match */}
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">Who can match with me</label>
          <div className="flex flex-wrap gap-2">
            {(['Founders', 'Freelancers', 'Investors'] as const).map((persona) => (
              <label key={persona} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked={persona !== 'Investors'} className="rounded" />
                <span className="text-sm text-neutral-700">{persona}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <Button variant="primary" size="sm" onClick={save} className="min-w-[140px]">
        {saved ? '✓ Saved' : 'Save preferences'}
      </Button>
    </div>
  );
}

// Main component
interface StakeholderDashboardProps {
  userName: string;
}

export function StakeholderDashboard({ userName: _userName }: StakeholderDashboardProps) {
  const [activeTab, setActiveTab] = useState<StakeholderTab>('overview');
  const [stakeholderRole, setStakeholderRole] = useState<StakeholderRole>('advisor');
  const [activityItems] = useState<ActivityItemData[]>([]);
  const [relevantMatches] = useState<RelevantMatch[]>([]);
  const [platformStats] = useState<PlatformStats>({ membersInNetwork: 0, liveDeals: 0 });
  const [connections] = useState<EngagementConnection[]>([]);
  const [introductions] = useState<Introduction[]>([]);

  const ROLE_LABEL: Record<StakeholderRole, string> = {
    advisor: 'Advisor',
    mentor: 'Mentor',
    corporate: 'Corporate',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Role indicator + tab bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Stakeholder dashboard sections"
          className="flex gap-1 bg-neutral-100 rounded-xl p-1 flex-1 min-w-0"
        >
          {TAB_DEF.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`stakeholder-panel-${id}`}
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

        {/* Role pill */}
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-warning-100 text-warning-700 border border-warning-200 shrink-0">
          {ROLE_LABEL[stakeholderRole]}
        </span>
      </div>

      {/* Overview panel */}
      <section
        id="stakeholder-panel-overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        hidden={activeTab !== 'overview'}
      >
        <OverviewPanel
          activityItems={activityItems}
          relevantMatches={relevantMatches}
          platformStats={platformStats}
          onConnect={() => {}}
        />
      </section>

      {/* Engagement panel */}
      <section
        id="stakeholder-panel-engagement"
        role="tabpanel"
        aria-labelledby="tab-engagement"
        hidden={activeTab !== 'engagement'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Engagement</h2>
        <EngagementPanel connections={connections} introductions={introductions} />
      </section>

      {/* Matches panel */}
      <section
        id="stakeholder-panel-matches"
        role="tabpanel"
        aria-labelledby="tab-matches"
        hidden={activeTab !== 'matches'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Your Matches</h2>
        {relevantMatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
            <p className="text-sm text-neutral-500 mb-1">No matches yet.</p>
            <p className="text-xs text-neutral-400">Complete your stakeholder profile to start receiving AI-matched connections.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {relevantMatches.map((m) => <MatchListItem key={m.id} match={m} onConnect={() => {}} />)}
          </div>
        )}
      </section>

      {/* Settings panel */}
      <section
        id="stakeholder-panel-settings"
        role="tabpanel"
        aria-labelledby="tab-settings"
        hidden={activeTab !== 'settings'}
      >
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Stakeholder Settings</h2>
        <SettingsPanel role={stakeholderRole} onRoleChange={setStakeholderRole} />
      </section>
    </div>
  );
}
