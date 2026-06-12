'use client';

import { useState } from 'react';
import { Star, CheckCircle2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseTagMeta, plainTags, type ProfileUser } from '@/types/profile';
import { PortfolioGrid } from '@/components/profile/PortfolioGrid';

interface Props {
  user: ProfileUser;
  isOwnProfile: boolean;
}

const SKILL_LEVELS = ['expert', 'skilled', 'learning'] as const;
type SkillLevel = typeof SKILL_LEVELS[number];

const SKILL_LEVEL_STYLES: Record<SkillLevel, string> = {
  expert: 'bg-success-100 text-success-700 border border-success-200',
  skilled: 'bg-primary-50 text-primary-700 border border-primary-100',
  learning: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
};

function SkillsSection({ skills, meta }: { skills: string[]; meta: Record<string, string> }) {
  const grouped: Record<SkillLevel, string[]> = { expert: [], skilled: [], learning: [] };
  for (const skill of skills) {
    const lvl = (meta[`skill_${skill.toLowerCase().replace(/\s+/g, '_')}`] ?? 'skilled') as SkillLevel;
    grouped[lvl in grouped ? lvl : 'skilled'].push(skill);
  }
  // If no level metadata, put everything in skilled
  if (grouped.expert.length === 0 && grouped.learning.length === 0) {
    grouped.skilled = skills;
  }

  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Skills &amp; Expertise</h2>
      {SKILL_LEVELS.map((lvl) =>
        grouped[lvl].length > 0 ? (
          <div key={lvl} className="mb-4 last:mb-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
              {lvl === 'expert' ? '★ Expert' : lvl === 'skilled' ? '· Skilled' : '○ Learning'}
            </p>
            <div className="flex flex-wrap gap-2">
              {grouped[lvl].map((skill) => (
                <span key={skill} className={cn('text-sm font-medium px-3 py-1 rounded-full', SKILL_LEVEL_STYLES[lvl])}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null,
      )}
    </section>
  );
}

function RateCard({ meta }: { meta: Record<string, string> }) {
  const dayRate = meta['rate'] ?? meta['dayRate'] ?? null;
  const availability = meta['availability'] ?? 'open';
  const availLabel: Record<string, string> = { open: 'Immediate', busy: 'Limited', offline: 'Not available' };
  const engagements = ['Contract work', 'Freelance project', 'Advisory'];

  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-5 sticky top-20">
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">Engagement Details</h2>
      <div className="space-y-2 mb-4">
        {dayRate && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Day rate</span>
            <span className="font-semibold text-neutral-900">{dayRate}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Availability</span>
          <span className="font-medium text-neutral-900">{availLabel[availability] ?? 'Immediate'}</span>
        </div>
      </div>
      <div className="border-t border-neutral-100 pt-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Open to</p>
        <div className="space-y-1.5">
          {engagements.map((e) => (
            <div key={e} className="flex items-center gap-2 text-sm text-neutral-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-success-600 shrink-0" />
              {e}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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

export function FreelancerProfileSections({ user, isOwnProfile }: Props) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const meta = parseTagMeta(user.profile?.tags ?? []);
  const skills = user.profile?.skills ?? [];
  const bio = user.profile?.bio ?? '';

  const portfolioItems = plainTags(user.profile?.tags ?? [])
    .filter((t) => t.startsWith('portfolio:'))
    .map((t, i) => {
      try { return { id: String(i), ...JSON.parse(t.slice(10)) }; } catch { return null; }
    })
    .filter(Boolean) as { id: string; title: string }[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {bio && <AboutSection bio={bio} expanded={bioExpanded} onToggle={() => setBioExpanded(!bioExpanded)} />}
        {skills.length > 0 && <SkillsSection skills={skills} meta={meta} />}
        <PortfolioGrid items={portfolioItems} isOwnProfile={isOwnProfile} />
      </div>
      <div className="space-y-6">
        <RateCard meta={meta} />
        {/* Stats sidebar */}
        <section className="bg-neutral-0 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Stats</h2>
          <div className="space-y-3">
            {[
              { label: 'Day rate', value: meta['rate'] ?? '—' },
              { label: 'Experience', value: meta['experience'] ?? '—' },
              { label: 'Location', value: user.region ?? '—' },
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
