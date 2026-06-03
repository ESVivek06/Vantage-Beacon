'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ConfettiReveal } from '@/components/onboarding/ConfettiReveal';
import { MatchScoreDonut } from '@/components/MatchScoreDonut';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';

interface PreviewMatch {
  id: string;
  name: string;
  role: string;
  location: string;
  score: number;
  summary: string;
  tags: string[];
}

const DEMO_MATCHES: PreviewMatch[] = [
  { id: '1', name: 'Priya Sharma', role: 'Founder · UK', location: 'London', score: 92, summary: 'Building a B2B SaaS for SME finance automation', tags: ['Fintech', 'SaaS'] },
  { id: '2', name: 'James Okafor', role: 'Investor · UK', location: 'Manchester', score: 87, summary: 'Pre-seed investor focused on deep tech and climate', tags: ['Deep Tech', 'Climate'] },
  { id: '3', name: 'Arjun Mehta', role: 'Founder · India', location: 'Bangalore', score: 81, summary: 'Co-founder of a marketplace for creator tools', tags: ['Creator Economy', 'Marketplace'] },
];

export default function OnboardingMatchRevealPage() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const matchCount = DEMO_MATCHES.length;

  return (
    <div className="min-h-dvh bg-neutral-0 flex flex-col items-center justify-start overflow-y-auto">
      {showConfetti && <ConfettiReveal count={60} />}

      <div
        className="w-full max-w-2xl mx-auto px-5 py-10 flex flex-col items-center text-center"
        aria-live="polite"
      >
        {/* Top badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-semibold uppercase tracking-widest mb-6">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          Your Matches Are Ready
        </span>

        <h1 className="text-display-lg font-bold text-neutral-900 mb-3">
          You've got {matchCount} new matches
        </h1>
        <p className="text-lg text-neutral-500 mb-10 max-w-md">
          Based on your profile and preferences, we found {matchCount} compatible connections.
        </p>

        {/* Preview carousel */}
        <div
          className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:overflow-visible md:grid md:grid-cols-3 mb-3"
          aria-label="Your top matches preview"
        >
          {DEMO_MATCHES.map((m, i) => (
            <div
              key={m.id}
              className="shrink-0 w-[300px] md:w-auto snap-start bg-neutral-0 border-[1.5px] border-neutral-200 rounded-xl p-5 shadow-xs transition-all duration-normal hover:-translate-y-[3px] hover:shadow-md"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="text-sm font-semibold bg-secondary-100 text-secondary-700">
                    {initials(m.name)}
                  </AvatarFallback>
                </Avatar>
                <MatchScoreDonut score={m.score} size="sm" />
              </div>
              <p className="text-sm font-semibold text-neutral-900 mb-0.5">{m.name}</p>
              <p className="text-xs text-neutral-400 mb-2">{m.role}</p>
              <p className="text-xs text-neutral-500 truncate mb-3">{m.summary}</p>
              <div className="flex gap-1.5 flex-wrap">
                {m.tags.map((t) => (
                  <span key={t} className="text-2xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mb-10">See your top match →</p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <Button variant="primary" size="xl" className="w-full" asChild>
            <Link href="/matches">
              View My Matches
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="ghost" size="md" asChild>
            <Link href="/profile/edit">Complete my profile first</Link>
          </Button>
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:underline">
            Go to dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
