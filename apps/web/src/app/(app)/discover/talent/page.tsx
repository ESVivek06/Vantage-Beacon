'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProfileCard } from '@/components/ProfileCard';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/graphql';
import { USERS_QUERY, SEND_CONNECTION_MUTATION } from '@/lib/queries';

interface User {
  id: string;
  email: string;
  role: string;
  region: string;
  photoUrl?: string;
  profile?: {
    displayName: string;
    bio?: string;
    skills: string[];
    verified: boolean;
  };
}

const skillTabs = ['All', 'React Developers', 'Designers', 'Product Managers', 'Finance'];

const domains = ['All', 'FinTech', 'HealthTech', 'B2B SaaS', 'D2C', 'EdTech', 'CleanTech'];

export default function DiscoverTalentPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [interestSent, setInterestSent] = useState<Record<string, boolean>>({});
  const [region, setRegion] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [linkedInOnly, setLinkedInOnly] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const data = await client.request<{ users: User[] }>(USERS_QUERY, { limit: 48 });
        const freelancers = data.users.filter(
          (u) => u.id !== session?.user?.id && u.role === 'freelancer',
        );
        setUsers(freelancers);
      } catch {
        // handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  async function handleExpressInterest(userId: string) {
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

  const filtered = users.filter((u) => {
    if (searchQuery && !u.profile?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (region !== 'All' && u.region !== region) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="bg-neutral-0 border-b border-neutral-200 px-4 sm:px-8 py-6">
        <h1 className="text-display-md font-bold text-neutral-900 mb-1">Discover Talent</h1>
        <p className="text-neutral-500">Find the right person for your next milestone</p>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 overflow-x-auto pb-1">
          {skillTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'shrink-0 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-fast',
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar filter — desktop */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-neutral-200 bg-neutral-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-700">Filters</h3>
              <button className="text-sm text-primary-600 hover:underline">Clear all</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-2">Location</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full h-10 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500"
                >
                  <option>All</option>
                  <option>UK</option>
                  <option>India</option>
                  <option>North America</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-2">Domain</label>
                <select className="w-full h-10 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500">
                  {domains.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="h-4 w-4 rounded-xs border-neutral-300 text-primary-600"
                  />
                  <span className="text-sm text-neutral-700">Available Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedInOnly}
                    onChange={(e) => setLinkedInOnly(e.target.checked)}
                    className="h-4 w-4 rounded-xs border-neutral-300"
                  />
                  <span className="text-sm text-neutral-700">LinkedIn Verified only</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <main className="flex-1 p-4 sm:p-6">
          {/* Search + sort bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by skill, name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-sm border border-neutral-300 text-sm bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)]"
              />
            </div>
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-neutral-700 font-medium hidden sm:block">
                {filtered.length} freelancers
              </span>
              <select className="h-9 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none">
                <option>Best match</option>
                <option>Newest</option>
                <option>Most experienced</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-lg animate-shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="h-16 w-16 mx-auto mb-6 text-neutral-300" />
              <h2 className="text-display-sm font-semibold text-neutral-700 mb-2">No freelancers found</h2>
              <p className="text-neutral-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((user) => (
                  <ProfileCard
                    key={user.id}
                    id={user.id}
                    name={user.profile?.displayName ?? user.email}
                    title={user.profile?.bio?.slice(0, 60)}
                    role={user.role}
                    location={user.region}
                    skills={user.profile?.skills ?? []}
                    verified={user.profile?.verified}
                    photoUrl={user.photoUrl}
                    onExpressInterest={handleExpressInterest}
                    interestSent={interestSent[user.id]}
                  />
                ))}
              </div>
              <div className="text-center mt-8">
                <Button variant="ghost" size="md">Load 12 more</Button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
