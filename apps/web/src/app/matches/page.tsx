'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Zap, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MatchScoreDonut } from '@/components/MatchScoreDonut';
import { MatchDetailSheet, type MatchDetail } from '@/components/MatchDetailSheet';
import { ConnectModal } from '@/components/ConnectModal';
import { EmptyStateMatchFeed } from '@/components/EmptyStateMatchFeed';
import { initials } from '@/lib/utils';

const DEMO_MATCHES: MatchDetail[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Founder',
    location: 'London, UK',
    matchScore: 92,
    verified: true,
    bio: 'Building a B2B SaaS for SME finance automation. Looking for a technical co-founder and early investors who believe in fintech for underserved markets.',
    matchReasons: ['Shared interest in fintech', 'Complementary skills', 'Same region'],
    skills: ['Fintech', 'SaaS', 'Product Strategy', 'Fundraising'],
    lookingFor: ['Technical co-founder', 'Seed investors'],
    links: [{ label: 'LinkedIn', url: '#' }],
  },
  {
    id: '2',
    name: 'James Okafor',
    role: 'Investor',
    location: 'Manchester, UK',
    matchScore: 87,
    verified: true,
    bio: 'Pre-seed investor focused on deep tech and climate. Portfolio includes 12 companies across UK and India.',
    matchReasons: ['Investment stage aligned', 'Sector overlap', 'Region match'],
    skills: ['Deep Tech', 'Climate', 'Pre-seed', 'Angel Investing'],
    lookingFor: ['Pre-seed startups', 'Founder-led companies'],
  },
  {
    id: '3',
    name: 'Arjun Mehta',
    role: 'Founder',
    location: 'Bangalore, India',
    matchScore: 81,
    bio: 'Co-founder of a marketplace for creator tools. Previously at Google and Flipkart.',
    matchReasons: ['Marketplace experience', 'Growth stage aligned'],
    skills: ['Creator Economy', 'Marketplace', 'Growth'],
    lookingFor: ['Marketing partners', 'UK expansion support'],
  },
  {
    id: '4',
    name: 'Suki Chen',
    role: 'Freelancer',
    location: 'Remote / Global',
    matchScore: 78,
    bio: 'Full-stack engineer specialising in React and Node.js. Available for project-based work.',
    matchReasons: ['Skill match', 'Availability aligned'],
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    lookingFor: ['Startup projects', 'Product roles'],
  },
  {
    id: '5',
    name: 'Nathan Brooks',
    role: 'Supplier',
    location: 'New York, USA',
    matchScore: 74,
    bio: 'B2B SaaS procurement specialist. Help startups source the right tools and negotiate enterprise contracts.',
    matchReasons: ['Service type aligned', 'North America coverage'],
    skills: ['Procurement', 'SaaS', 'Vendor Management'],
    lookingFor: ['Early-stage startups', 'Scale-ups'],
  },
  {
    id: '6',
    name: 'Meera Nair',
    role: 'Stakeholder',
    location: 'Mumbai, India',
    matchScore: 71,
    bio: 'Board advisor and ex-McKinsey. Focused on South Asia market entry and governance.',
    matchReasons: ['Advisory experience', 'India market expertise'],
    skills: ['Strategy', 'Governance', 'Market Entry', 'India'],
    lookingFor: ['Board advisory roles', 'Mentoring founders'],
  },
];

interface MatchCardMC01Props {
  match: MatchDetail;
  isNew?: boolean;
  saved: boolean;
  onSave: (id: string) => void;
  onConnect: (id: string) => void;
  onClick: (match: MatchDetail) => void;
  revealIndex: number;
}

function MatchCardMC01({ match, isNew, saved, onSave, onConnect, onClick, revealIndex }: MatchCardMC01Props) {
  return (
    <article
      className="relative bg-neutral-0 border-[1.5px] border-neutral-200 rounded-xl p-6 shadow-xs transition-all duration-normal hover:-translate-y-1 hover:shadow-md hover:border-neutral-300 cursor-pointer animate-card-reveal"
      style={{ animationDelay: `${revealIndex * 0.08}s`, opacity: 0 }}
      onClick={() => onClick(match)}
      aria-label={`Match: ${match.name}, ${match.role}, ${match.matchScore}% match`}
    >
      {isNew && (
        <span className="absolute top-4 left-4 text-2xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary-500 text-white" aria-label="New match">
          NEW
        </span>
      )}

      {/* Top bar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {match.photoUrl && <AvatarImage src={match.photoUrl} alt={match.name} />}
            <AvatarFallback className="text-sm font-semibold bg-secondary-100 text-secondary-700">
              {initials(match.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-md font-semibold text-neutral-900">{match.name}</p>
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 mt-0.5">
              {match.role}
            </span>
            {match.location && (
              <p className="text-xs text-neutral-400 mt-0.5">{match.location}</p>
            )}
          </div>
        </div>
        <MatchScoreDonut score={match.matchScore} size="md" animate />
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-100 mb-4" aria-hidden="true" />

      {/* Bio excerpt */}
      {match.bio && (
        <p className="text-sm text-neutral-700 mb-3 line-clamp-2">{match.bio}</p>
      )}

      {/* Tags */}
      {match.skills && match.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {match.skills.slice(0, 4).map((s) => (
            <span key={s} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{s}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="min-w-[60px]">
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600">
              <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              Saved
            </span>
          )}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            aria-label={saved ? 'Unsave match' : 'Save match for later'}
            onClick={(e) => { e.stopPropagation(); onSave(match.id); }}
          >
            {saved ? <BookmarkCheck className="h-4 w-4 text-primary-500" /> : <Bookmark className="h-4 w-4" />}
            {saved ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            aria-label={`Connect with ${match.name}`}
            onClick={(e) => { e.stopPropagation(); onConnect(match.id); }}
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            Connect
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function MatchFeedPage() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [detailMatch, setDetailMatch] = useState<MatchDetail | null>(null);
  const [connectMatch, setConnectMatch] = useState<MatchDetail | null>(null);

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openConnect(id: string) {
    const m = DEMO_MATCHES.find((x) => x.id === id);
    if (m) setConnectMatch(m);
  }

  const isEmpty = DEMO_MATCHES.length === 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-10 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-display-md font-bold text-neutral-900">Your Matches</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {DEMO_MATCHES.length} matches based on your profile · Updated just now
            </p>
          </div>
          <Button variant="ghost" size="sm" aria-label="Filter matches">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
          </Button>
        </div>

        {isEmpty ? (
          <EmptyStateMatchFeed />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEMO_MATCHES.map((m, i) => (
              <MatchCardMC01
                key={m.id}
                match={m}
                isNew={i < 3}
                saved={saved.has(m.id)}
                onSave={toggleSave}
                onConnect={openConnect}
                onClick={setDetailMatch}
                revealIndex={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Match detail sheet */}
      {detailMatch && (
        <MatchDetailSheet
          match={detailMatch}
          saved={saved.has(detailMatch.id)}
          onClose={() => setDetailMatch(null)}
          onSave={(id) => { toggleSave(id); }}
          onConnect={(id) => { setDetailMatch(null); openConnect(id); }}
        />
      )}

      {/* Connect modal */}
      {connectMatch && (
        <ConnectModal
          name={connectMatch.name}
          onClose={() => setConnectMatch(null)}
          onViewMatches={() => setConnectMatch(null)}
        />
      )}
    </div>
  );
}
