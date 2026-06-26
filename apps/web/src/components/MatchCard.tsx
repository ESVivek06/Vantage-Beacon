'use client';

import Link from 'next/link';
import { Sparkles, Star, TrendingUp, Zap, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { TrustBadgeT0, TrustBadgeT1, RoleBadge } from './TrustBadge';
import { initials } from '@/lib/utils';

export interface MatchCardProps {
  id: string;
  name: string;
  title?: string;
  role: string;
  location?: string;
  domain?: string;
  skills?: string[];
  matchingSkills?: string[];
  matchReasons?: string[];
  photoUrl?: string;
  verified?: boolean;
  linkedIn?: boolean;
  available?: boolean;
  matchScore?: number;
  onExpressInterest?: (id: string) => void;
  onAccept?: (id: string) => void;
  onPass?: (id: string) => void;
  interestSent?: boolean;
  accepted?: boolean;
  passed?: boolean;
}

function MatchScoreArc({ score = 75 }: { score?: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const filled = arcLength * (score / 100);

  let arcColor = '#94A3B8';
  if (score >= 85) arcColor = '#22C55E';
  else if (score >= 65) arcColor = '#F59E0B';
  else if (score >= 40) arcColor = '#14B8A6';

  return (
    <div
      className="relative w-14 h-14"
      role="img"
      aria-label={`AI match score: ${score} percent`}
    >
      <svg viewBox="0 0 52 52" className="w-full h-full -rotate-[135deg]">
        <circle
          cx="26" cy="26" r={radius}
          fill="none" stroke="#E2E8F0" strokeWidth="4"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
        />
        <circle
          cx="26" cy="26" r={radius}
          fill="none" stroke={arcColor} strokeWidth="4"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-lg font-extrabold text-primary-600 leading-none"
          aria-hidden="true"
        >
          {score}
        </span>
      </div>
    </div>
  );
}

export function MatchCard({
  id,
  name,
  title,
  role,
  location,
  domain,
  skills = [],
  matchingSkills = [],
  matchReasons = [],
  photoUrl,
  verified,
  linkedIn,
  available,
  matchScore,
  onExpressInterest,
  onAccept,
  onPass,
  interestSent,
  accepted,
  passed,
}: MatchCardProps) {
  const maxSkills = 3;
  const allSkills = [...new Set([...matchingSkills, ...skills])];

  return (
    <article
      className={[
        'relative bg-neutral-0 border rounded-lg shadow-sm p-5 hover:shadow-md transition-all duration-normal',
        accepted ? 'border-l-4 border-l-success-600 border-neutral-200' : 'border-neutral-200',
        passed ? 'opacity-50' : '',
      ].join(' ')}
    >
      {/* Status badges overlay */}
      {interestSent && (
        <span className="absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
          Interest Sent
        </span>
      )}
      {accepted && (
        <span className="absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full bg-success-100 text-success-700">
          Accepted
        </span>
      )}
      {passed && (
        <span className="absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
          Passed
        </span>
      )}

      {/* ROW 1 — Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/profile/${id}`} className="shrink-0">
          <Avatar className="h-14 w-14">
            {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
            <AvatarFallback className="text-lg font-semibold bg-primary-100 text-primary-700">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${id}`}>
            <h3 className="text-md font-semibold text-neutral-900 hover:text-primary-600 transition-colors leading-tight">
              {name}
            </h3>
          </Link>
          {title && <p className="text-sm text-neutral-600 truncate">{title}</p>}
        </div>
        {matchScore !== undefined && (
          <MatchScoreArc score={matchScore} />
        )}
      </div>

      {/* ROW 2 — Meta chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {location && (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
            <MapPin className="h-3 w-3" />
            {location}
          </span>
        )}
        {domain && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
            {domain}
          </span>
        )}
        <RoleBadge role={role} />
        {linkedIn && <TrustBadgeT1 />}
        {verified && !linkedIn && <TrustBadgeT0 />}
        {available && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-100 text-success-700">
            Available
          </span>
        )}
      </div>

      {/* ROW 3 — Match Reasons */}
      {matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {matchReasons.slice(0, 3).map((reason) => (
            <span
              key={reason}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200"
            >
              <Sparkles className="h-2.5 w-2.5 text-secondary-500" />
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* ROW 4 — Skills */}
      {allSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {allSkills.slice(0, maxSkills).map((skill) => (
            <span
              key={skill}
              className={[
                'text-xs font-medium px-2 py-0.5 rounded-full',
                matchingSkills.includes(skill)
                  ? 'bg-success-100 text-success-700 border border-success-100'
                  : 'bg-neutral-100 text-neutral-700',
              ].join(' ')}
            >
              {skill}
            </span>
          ))}
          {allSkills.length > maxSkills && (
            <span className="text-xs text-neutral-500 px-2 py-0.5">
              +{allSkills.length - maxSkills} more
            </span>
          )}
        </div>
      )}

      {/* ROW 5 — CTAs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="primary"
          size="sm"
          disabled={!!interestSent || !!accepted}
          onClick={() => onExpressInterest?.(id)}
        >
          Express Interest
        </Button>
        {onAccept && (
          <Button
            variant="success"
            size="sm"
            disabled={!!accepted}
            onClick={() => onAccept(id)}
          >
            Accept
          </Button>
        )}
        {onPass && !passed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPass(id)}
          >
            Pass
          </Button>
        )}
        {passed && (
          <button
            className="text-xs text-primary-600 hover:underline"
            onClick={() => onPass?.(id)}
          >
            Undo
          </button>
        )}
      </div>
    </article>
  );
}
