'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GeoTag, TrustBadgeT1 } from '@/components/TrustBadge';
import { createClient } from '@/lib/graphql';
import { USERS_QUERY } from '@/lib/queries';
import { initials } from '@/lib/utils';

interface ServiceProvider {
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

const categoryTabs = ['All', 'Legal', 'Finance', 'Marketing', 'Tech', 'Operations'];

function ServiceCard({ provider }: { provider: ServiceProvider }) {
  const name = provider.profile?.displayName ?? provider.email;
  const skills = provider.profile?.skills ?? [];
  const randomRating = 4 + Math.random() * 0.9;

  return (
    <div className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-normal">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-12 w-12">
          {provider.photoUrl && <AvatarImage src={provider.photoUrl} alt={name} />}
          <AvatarFallback className="bg-secondary-100 text-secondary-700 font-semibold">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 truncate">
            {skills[0] ? `${skills[0]} Services` : 'Professional Services'}
          </h3>
          <p className="text-xs text-neutral-500">{name}</p>
        </div>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
          From £500
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
          2–5 days
        </span>
        {provider.region && <GeoTag location={provider.region} />}
        {provider.profile?.verified && <TrustBadgeT1 />}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= Math.round(randomRating) ? 'fill-accent-400 text-accent-400' : 'text-neutral-300'}`}
          />
        ))}
        <span className="text-xs text-neutral-500 ml-1">{randomRating.toFixed(1)}</span>
      </div>

      {/* Description */}
      {provider.profile?.bio && (
        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{provider.profile.bio}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="primary" size="sm" className="flex-1">
          Contact Provider
        </Button>
        <Button variant="ghost" size="sm" disabled title="Available soon">
          View Workspace
        </Button>
      </div>
    </div>
  );
}

export default function DiscoverServicesPage() {
  const { data: session } = useSession();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const data = await client.request<{ users: ServiceProvider[] }>(USERS_QUERY, { limit: 48 });
        const suppliers = data.users.filter(
          (u) => u.id !== session?.user?.id && u.role === 'supplier',
        );
        setProviders(suppliers);
      } catch {
        // handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  const filtered = providers.filter((p) => {
    if (searchQuery && !p.profile?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-neutral-0 border-b border-neutral-200 px-4 sm:px-8 py-6">
        <h1 className="text-display-md font-bold text-neutral-900 mb-1">Discover Services</h1>
        <p className="text-neutral-500">Hire vetted services for your project</p>

        <div className="flex gap-1 mt-5 overflow-x-auto pb-1">
          {categoryTabs.map((tab) => (
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
        {/* Sidebar */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-neutral-200 bg-neutral-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-700">Filters</h3>
            <button className="text-sm text-primary-600 hover:underline">Clear all</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 block mb-2">Location</label>
              <select className="w-full h-10 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500">
                <option>All</option>
                <option>UK</option>
                <option>India</option>
                <option>North America</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 block mb-2">Budget range</label>
              <select className="w-full h-10 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500">
                <option>Any budget</option>
                <option>Under £500</option>
                <option>£500 – £2,000</option>
                <option>£2,000+</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded-xs border-neutral-300" />
              <span className="text-sm text-neutral-700">LinkedIn Verified only</span>
            </label>
          </div>
        </aside>

        {/* Main grid */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search services…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-sm border border-neutral-300 text-sm bg-neutral-0 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="ml-auto text-sm text-neutral-700 font-medium hidden sm:block">
              {filtered.length} providers
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-lg animate-shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="h-16 w-16 mx-auto mb-6 text-neutral-300" />
              <h2 className="text-display-sm font-semibold text-neutral-700 mb-2">No services found</h2>
              <p className="text-neutral-500">Try adjusting your search</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <ServiceCard key={p.id} provider={p} />
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
