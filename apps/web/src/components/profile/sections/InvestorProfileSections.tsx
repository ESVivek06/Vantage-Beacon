'use client';

import { useState } from 'react';
import { DollarSign, Target, Building2 } from 'lucide-react';
import { parseTagMeta, type ProfileUser } from '@/types/profile';

interface Props {
  user: ProfileUser;
  isOwnProfile: boolean;
}

function AboutSection({ bio, expanded, onToggle }: { bio: string; expanded: boolean; onToggle: () => void }) {
  const truncated = bio.length > 300;
  const shown = expanded || !truncated ? bio : bio.slice(0, 300) + '…';
  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-3">Investment Thesis</h2>
      <p className="text-sm text-neutral-700 leading-relaxed">{shown}</p>
      {truncated && (
        <button onClick={onToggle} className="mt-2 text-sm text-primary-600 hover:underline font-medium">
          {expanded ? 'Show less' : 'Read more →'}
        </button>
      )}
    </section>
  );
}

function InvestorCard({ meta }: { meta: Record<string, string> }) {
  const checkSize = meta['checkSize'] ?? meta['check_size'] ?? null;
  const stage = meta['stage'] ?? null;
  const portfolio = meta['portfolioCount'] ?? null;
  const leadRounds = meta['leadRounds'] === 'true';

  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-5 sticky top-20">
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">Investment Profile</h2>
      <div className="space-y-3">
        {checkSize && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Check size</span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
              <DollarSign className="h-3.5 w-3.5" />
              {checkSize}
            </span>
          </div>
        )}
        {stage && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Stage focus</span>
            <span className="text-sm font-medium text-neutral-900">{stage}</span>
          </div>
        )}
        {portfolio && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Portfolio cos.</span>
            <span className="inline-flex items-center gap-1 font-medium text-neutral-900">
              <Building2 className="h-3.5 w-3.5 text-neutral-400" />
              {portfolio}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Leads rounds</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${leadRounds ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600'}`}>
            {leadRounds ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </section>
  );
}

export function InvestorProfileSections({ user, isOwnProfile }: Props) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const meta = parseTagMeta(user.profile?.tags ?? []);
  const skills = user.profile?.skills ?? [];
  const bio = user.profile?.bio ?? '';
  const focusAreas = meta['focusAreas'] ? meta['focusAreas'].split(',').map((s) => s.trim()) : skills;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {bio && <AboutSection bio={bio} expanded={bioExpanded} onToggle={() => setBioExpanded(!bioExpanded)} />}

        {focusAreas.length > 0 && (
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Focus Areas</h2>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <span key={area} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <Target className="h-3 w-3" />
                  {area}
                </span>
              ))}
            </div>
          </section>
        )}

        {meta['criteria'] && (
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Investment Criteria</h2>
            <p className="text-sm text-neutral-700 leading-relaxed">{meta['criteria']}</p>
          </section>
        )}

        {user.ownedProjects && user.ownedProjects.length > 0 && (
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Active Opportunities</h2>
            <div className="space-y-3">
              {user.ownedProjects.map((p) => (
                <div key={p.id} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-neutral-900">{p.title}</span>
                    <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {p.status}
                    </span>
                  </div>
                  {p.description && <p className="text-xs text-neutral-500 line-clamp-2">{p.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="space-y-6">
        <InvestorCard meta={meta} />
        <section className="bg-neutral-0 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">At a Glance</h2>
          <div className="space-y-3">
            {[
              { label: 'Location', value: user.region ?? '—' },
              { label: 'Fund type', value: meta['fundType'] ?? '—' },
              { label: 'Geographic focus', value: meta['geo'] ?? '—' },
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
