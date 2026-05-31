'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Sparkles, Filter, Clock, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchCard } from '@/components/MatchCard';
import { createClient } from '@/lib/graphql';
import { USERS_QUERY, SEND_CONNECTION_MUTATION } from '@/lib/queries';
import { roleLabel } from '@/lib/utils';

interface UserMatch {
  id: string;
  email: string;
  role: string;
  region: string;
  photoUrl?: string;
  profile?: {
    displayName: string;
    bio?: string;
    skills: string[];
    tags: string[];
    verified: boolean;
  };
}

const feedFilters = ['All', 'Strong Matches', 'Same Timezone', 'Available Now'];

export default function FeedPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [interestSent, setInterestSent] = useState<Record<string, boolean>>({});
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [passed, setPassed] = useState<Record<string, boolean>>({});

  async function loadMatches() {
    setLoading(true);
    try {
      const client = createClient();
      const data = await client.request<{ users: UserMatch[] }>(USERS_QUERY, { limit: 20 });
      const filtered = data.users.filter((u) => u.id !== session?.user?.id);
      setMatches(filtered.slice(0, 12));
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, [session]);

  async function handleExpressInterest(userId: string) {
    if (!session?.user) return;
    setInterestSent((p) => ({ ...p, [userId]: true }));
    try {
      const client = createClient();
      await client.request(SEND_CONNECTION_MUTATION, {
        input: { receiverId: userId, kind: 'collaboration' },
      });
    } catch {
      setInterestSent((p) => ({ ...p, [userId]: false }));
    }
  }

  const visibleMatches = matches.filter((m) => !passed[m.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Feed column */}
        <div className="flex-1 min-w-0 max-w-2xl">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-display-sm font-semibold text-neutral-900">Your Matches</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Updated just now · {matches.length} matches
            </p>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {feedFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={[
                  'shrink-0 text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-fast',
                  activeFilter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                ].join(' ')}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Match cards */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-lg animate-shimmer" />
              ))}
            </div>
          ) : visibleMatches.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="h-16 w-16 mx-auto mb-6 text-neutral-300" />
              <h2 className="text-display-sm font-semibold text-neutral-700 mb-2">
                No matches yet
              </h2>
              <p className="text-md text-neutral-500 max-w-xs mx-auto mb-6">
                Complete your profile to unlock AI-powered matches.
              </p>
              <Button variant="primary" size="md" asChild>
                <Link href="/profile">Complete Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleMatches.map((user) => {
                const name = user.profile?.displayName ?? user.email;
                const skills = user.profile?.skills ?? [];
                const randomScore = 50 + Math.floor(Math.random() * 45);
                const reasons = [
                  'Skills overlap',
                  `Based in ${user.region ?? 'your region'}`,
                  `${roleLabel(user.role)} match`,
                ].slice(0, 2);

                return (
                  <MatchCard
                    key={user.id}
                    id={user.id}
                    name={name}
                    title={user.profile?.bio?.slice(0, 60) || undefined}
                    role={user.role}
                    location={user.region}
                    skills={skills}
                    matchingSkills={skills.slice(0, 2)}
                    matchReasons={reasons}
                    photoUrl={user.photoUrl}
                    verified={user.profile?.verified}
                    matchScore={randomScore}
                    interestSent={interestSent[user.id]}
                    accepted={accepted[user.id]}
                    passed={passed[user.id]}
                    onExpressInterest={handleExpressInterest}
                    onAccept={(id) => setAccepted((p) => ({ ...p, [id]: true }))}
                    onPass={(id) =>
                      setPassed((p) =>
                        p[id] ? { ...p, [id]: false } : { ...p, [id]: true },
                      )
                    }
                  />
                );
              })}

              <button
                onClick={loadMatches}
                className="w-full py-3 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors duration-fast"
              >
                Load more matches
              </button>
            </div>
          )}
        </div>

        {/* Right rail — desktop only */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 bg-neutral-0 border border-neutral-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Filter By
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-2">Location</label>
                <select className="w-full h-10 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)]">
                  <option>All regions</option>
                  <option>UK</option>
                  <option>India</option>
                  <option>North America</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-2">Domain</label>
                <select className="w-full h-10 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)]">
                  <option>All domains</option>
                  <option>FinTech</option>
                  <option>HealthTech</option>
                  <option>B2B SaaS</option>
                  <option>EdTech</option>
                  <option>CleanTech</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded-xs" />
                  <span className="text-sm text-neutral-700">Available Now</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded-xs" />
                  <span className="text-sm text-neutral-700">LinkedIn Verified only</span>
                </label>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
