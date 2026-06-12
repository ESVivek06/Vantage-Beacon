'use client';

import { useState } from 'react';
import { CheckCircle2, Package } from 'lucide-react';
import { parseTagMeta, type ProfileUser } from '@/types/profile';
import { PortfolioGrid } from '@/components/profile/PortfolioGrid';
import { plainTags } from '@/types/profile';

interface Props {
  user: ProfileUser;
  isOwnProfile: boolean;
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

function ServiceCard({ meta, skills }: { meta: Record<string, string>; skills: string[] }) {
  const minRate = meta['minRate'] ?? null;
  const maxRate = meta['maxRate'] ?? null;
  const rateRange = minRate && maxRate ? `${minRate} – ${maxRate}` : (minRate ?? maxRate ?? null);
  const turnaround = meta['turnaround'] ?? null;
  const remote = meta['remote'] !== 'false';

  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-5 sticky top-20">
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">Service Details</h2>
      <div className="space-y-3">
        {rateRange && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Rate</span>
            <span className="font-semibold text-violet-700">{rateRange}</span>
          </div>
        )}
        {turnaround && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Typical turnaround</span>
            <span className="font-medium text-neutral-900">{turnaround}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Remote</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${remote ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600'}`}>
            {remote ? 'Available' : 'On-site only'}
          </span>
        </div>
      </div>
      {skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Specialisations</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((s) => (
              <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function SupplierProfileSections({ user, isOwnProfile }: Props) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const meta = parseTagMeta(user.profile?.tags ?? []);
  const skills = user.profile?.skills ?? [];
  const bio = user.profile?.bio ?? '';
  const servicesRaw = meta['services'] ?? '';
  const services = servicesRaw ? servicesRaw.split(',').map((s) => s.trim()) : [];

  const caseStudies = plainTags(user.profile?.tags ?? [])
    .filter((t) => t.startsWith('case:'))
    .map((t, i) => {
      try { return { id: String(i), ...JSON.parse(t.slice(5)) }; } catch { return null; }
    })
    .filter(Boolean) as { id: string; title: string }[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {bio && <AboutSection bio={bio} expanded={bioExpanded} onToggle={() => setBioExpanded(!bioExpanded)} />}

        {services.length > 0 && (
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Services Offered</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((service) => (
                <div key={service} className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3">
                  <CheckCircle2 className="h-4 w-4 text-violet-600 shrink-0" />
                  <span className="text-sm text-neutral-800">{service}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <PortfolioGrid
          items={caseStudies}
          isOwnProfile={isOwnProfile}
          title="Case Studies"
        />

        {skills.length > 0 && (
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Skills &amp; Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="text-sm font-medium px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="space-y-6">
        <ServiceCard meta={meta} skills={skills} />
        <section className="bg-neutral-0 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">At a Glance</h2>
          <div className="space-y-3">
            {[
              { label: 'Location', value: user.region ?? '—' },
              { label: 'Company size', value: meta['companySize'] ?? '—' },
              { label: 'Projects done', value: meta['projectsDone'] ?? '—' },
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
