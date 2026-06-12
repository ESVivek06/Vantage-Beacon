'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseTagMeta, type ProfileUser } from '@/types/profile';

interface Props {
  user: ProfileUser;
  isOwnProfile: boolean;
}

const FUNDING_STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Bootstrapped'];

function AboutSection({ bio, expanded, onToggle }: { bio: string; expanded: boolean; onToggle: () => void }) {
  const truncated = bio.length > 300;
  const shown = expanded || !truncated ? bio : bio.slice(0, 300) + '…';
  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-3">About</h2>
      <p className="text-sm text-neutral-700 leading-relaxed">{shown}</p>
      {truncated && (
        <button onClick={onToggle} className="mt-2 text-sm text-primary-600 hover:underline font-medium">
          {expanded ? 'Show less' : 'Read more →'}
        </button>
      )}
    </section>
  );
}

function CompanyCard({ meta }: { meta: Record<string, string> }) {
  const company = meta['company'] ?? null;
  const fundingStage = meta['fundingStage'] ?? null;
  const teamSize = meta['teamSize'] ?? null;
  const industry = meta['industry'] ?? null;
  const website = meta['website'] ?? null;

  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-5 sticky top-20">
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">Company Details</h2>
      <div className="space-y-3">
        {company && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Company</span>
            <span className="font-semibold text-neutral-900">{company}</span>
          </div>
        )}
        {industry && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Industry</span>
            <span className="font-medium text-neutral-900">{industry}</span>
          </div>
        )}
        {fundingStage && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Stage</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
              <TrendingUp className="h-3 w-3" />
              {fundingStage}
            </span>
          </div>
        )}
        {teamSize && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Team size</span>
            <span className="inline-flex items-center gap-1 font-medium text-neutral-900">
              <Users className="h-3.5 w-3.5 text-neutral-400" />
              {teamSize}
            </span>
          </div>
        )}
        {website && (
          <div className="pt-2 border-t border-neutral-100">
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              {website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function OpenOpportunities({ projects }: { projects: ProfileUser['ownedProjects'] }) {
  if (!projects || projects.length === 0) return null;
  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Open Opportunities</h2>
        <span className="text-xs text-neutral-500">{projects.length} active</span>
      </div>
      <div className="space-y-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/opportunities/${p.id}`}
            className="block rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-semibold text-sm text-neutral-900">{p.title}</span>
              <span className={cn(
                'shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full',
                p.status === 'open' ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500',
              )}>
                {p.status}
              </span>
            </div>
            {p.description && <p className="text-xs text-neutral-500 line-clamp-2">{p.description}</p>}
            {p.requiredSkills && p.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {p.requiredSkills.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{s}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FounderProfileSections({ user, isOwnProfile }: Props) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const meta = parseTagMeta(user.profile?.tags ?? []);
  const skills = user.profile?.skills ?? [];
  const bio = user.profile?.bio ?? '';
  const lookingFor = meta['lookingFor'] ?? '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {bio && <AboutSection bio={bio} expanded={bioExpanded} onToggle={() => setBioExpanded(!bioExpanded)} />}

        {lookingFor && (
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Currently Looking For</h2>
            <p className="text-sm text-neutral-700 leading-relaxed">{lookingFor}</p>
          </section>
        )}

        <OpenOpportunities projects={user.ownedProjects} />

        {skills.length > 0 && (
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Expertise &amp; Focus Areas</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="text-sm font-medium px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="space-y-6">
        <CompanyCard meta={meta} />
        <section className="bg-neutral-0 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">At a Glance</h2>
          <div className="space-y-3">
            {[
              { label: 'Location', value: user.region ?? '—' },
              { label: 'Founded', value: meta['founded'] ?? '—' },
              { label: 'Hiring', value: (user.ownedProjects?.length ?? 0) > 0 ? 'Yes' : 'Not currently' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-neutral-500">{label}</span>
                <span className="font-medium text-neutral-900">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
