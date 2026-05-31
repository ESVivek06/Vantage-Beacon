'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpportunityCard } from '@/components/OpportunityCard';
import { createClient } from '@/lib/graphql';
import { PROJECTS_QUERY } from '@/lib/queries';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  requiredSkills: string[];
  owner?: { profile?: { displayName: string }; role: string };
  createdAt: string;
}

export default function OpportunitiesPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const data = await client.request<{ projects: Project[] }>(PROJECTS_QUERY, { limit: 24 });
        setProjects(data.projects);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = projects.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const role = (session?.user as { role?: string })?.role;
  const canPost = role === 'founder' || role === 'investor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-display-md font-bold text-neutral-900">Opportunities</h1>
          <p className="text-neutral-500 mt-1">Find your next project, role, or collaboration</p>
        </div>
        {canPost && (
          <Button variant="primary" size="md" asChild>
            <Link href="/opportunities/new">
              <Plus className="h-4 w-4" />
              Post Opportunity
            </Link>
          </Button>
        )}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search opportunities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-sm border border-neutral-300 text-sm bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)]"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Open', 'Urgent'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={[
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                statusFilter === f
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-300',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-16 w-16 mx-auto mb-6 text-neutral-300" />
          <h2 className="text-display-sm font-semibold text-neutral-700 mb-2">
            No opportunities found
          </h2>
          <p className="text-neutral-500 mb-6">Try a different search or filter</p>
          {canPost && (
            <Button variant="primary" size="md" asChild>
              <Link href="/opportunities/new">Post the first opportunity</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <OpportunityCard
              key={p.id}
              id={p.id}
              title={p.title}
              posterName={p.owner?.profile?.displayName}
              role={p.owner?.role}
              description={p.description}
              skills={p.requiredSkills}
              status={p.status === 'open' ? 'open' : 'closed'}
              postedAt={p.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
