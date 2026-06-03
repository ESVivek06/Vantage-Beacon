'use client';

import { X, CheckCircle2, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MatchScoreDonut } from './MatchScoreDonut';
import { initials } from '@/lib/utils';

export interface MatchDetail {
  id: string;
  name: string;
  role: string;
  location?: string;
  photoUrl?: string;
  matchScore: number;
  verified?: boolean;
  bio?: string;
  matchReasons?: string[];
  skills?: string[];
  lookingFor?: string[];
  links?: { label: string; url: string }[];
}

interface MatchDetailSheetProps {
  match: MatchDetail;
  onClose: () => void;
  onConnect: (id: string) => void;
  onSave: (id: string) => void;
  saved?: boolean;
}

export function MatchDetailSheet({ match, onClose, onConnect, onSave, saved }: MatchDetailSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop: modal overlay | Mobile: bottom sheet */}
      <div
        className={[
          'fixed z-50 bg-neutral-0 overflow-y-auto',
          // Desktop: centered modal
          'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-[640px] md:max-h-[90vh] md:rounded-2xl md:shadow-2xl md:animate-modal-mount',
          // Mobile: bottom sheet
          'max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:h-[92dvh] max-md:rounded-t-2xl max-md:animate-sheet-slide-up',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={`Match detail: ${match.name}`}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-300" aria-hidden="true" />
        </div>

        {/* Close (desktop) */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 h-8 w-8 items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pb-28">
          {/* Hero */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
            <Avatar className="h-20 w-20 shrink-0">
              {match.photoUrl && <AvatarImage src={match.photoUrl} alt={match.name} />}
              <AvatarFallback className="text-xl font-bold bg-secondary-100 text-secondary-700">
                {initials(match.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-display-sm font-bold text-neutral-900">{match.name}</h2>
                {match.verified && (
                  <CheckCircle2 className="h-4 w-4 text-primary-500" aria-label="Verified member" />
                )}
              </div>
              <p className="text-md text-neutral-500">{match.role}{match.location && ` · ${match.location}`}</p>
            </div>
            <MatchScoreDonut score={match.matchScore} size="lg" className="shrink-0" />
          </div>

          {/* Match reasons */}
          {match.matchReasons && match.matchReasons.length > 0 && (
            <section className="mb-5" aria-label="Why you match">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Why you match
              </h3>
              <ul className="space-y-2">
                {match.matchReasons.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 bg-secondary-50 border border-secondary-100 rounded-md px-3 py-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-secondary-500 mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="text-sm text-neutral-700">{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Bio */}
          {match.bio && (
            <section className="mb-5" aria-label="About">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-2">About</h3>
              <p className="text-md text-neutral-700">{match.bio}</p>
            </section>
          )}

          {/* Skills */}
          {match.skills && match.skills.length > 0 && (
            <section className="mb-5" aria-label="Skills">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {match.skills.map((s) => (
                  <span key={s} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Looking for */}
          {match.lookingFor && match.lookingFor.length > 0 && (
            <section className="mb-5" aria-label="Looking for">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-2">Looking for</h3>
              <div className="flex flex-wrap gap-1.5">
                {match.lookingFor.map((s) => (
                  <span key={s} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          {match.links && match.links.length > 0 && (
            <section aria-label="Contact links">
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-2">Links</h3>
              <div className="flex flex-wrap gap-2">
                {match.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {l.label}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-neutral-0 border-t border-neutral-200 px-6 py-4 flex gap-3 justify-end flex-wrap">
          <Button variant="secondary" size="md" onClick={() => onSave(match.id)}>
            {saved ? 'Saved' : 'Save for Later'}
          </Button>
          <Button variant="primary" size="md" onClick={() => onConnect(match.id)}>
            Connect
          </Button>
        </div>
      </div>
    </>
  );
}
