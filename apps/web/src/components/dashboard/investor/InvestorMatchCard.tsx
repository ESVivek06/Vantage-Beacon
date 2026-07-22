'use client';

import { Sparkles, MapPin, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustBadgeT1 } from '@/components/TrustBadge';
import { initials } from '@/lib/utils';

const STAGE_LABELS: Record<string, string> = {
  pre_seed: 'Pre-seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b_plus: 'Series B+',
};

function MatchScoreArc({ score = 75 }: { score?: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const filled = arcLength * (score / 100);

  // Investor arc uses amber (role-investor) for high-confidence matches
  let arcColor = '#94A3B8';
  if (score >= 85) arcColor = '#D97706';
  else if (score >= 65) arcColor = '#F59E0B';
  else if (score >= 40) arcColor = '#14B8A6';

  return (
    <div
      className="relative w-14 h-14 shrink-0"
      role="img"
      aria-label={`Compatibility indicator: ${score} out of 100`}
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
          style={{ fontSize: 18, fontWeight: 800, color: '#D97706', lineHeight: 1 }}
          aria-hidden="true"
        >
          {score}
        </span>
      </div>
    </div>
  );
}

function LockedField({ label }: { label: string }) {
  return (
    <span className="text-neutral-300 italic flex items-center gap-1">
      {label}
      <Lock
        className="h-3 w-3 text-neutral-300 inline"
        aria-label="Data not shared by founder"
      />
    </span>
  );
}

export interface InvestorMatchCardProps {
  id: string;
  founderName: string;
  startupName?: string;
  title?: string;
  location?: string;
  photoUrl?: string;
  verified?: boolean;
  linkedIn?: boolean;
  matchScore?: number;
  fundingStage?: 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus';
  sector?: string;
  raisingAmount?: string;
  traction?: string;
  matchReasons?: string[];
  consentedFields?: string[];
  dataRedacted?: boolean;
  interestSent?: boolean;
  passed?: boolean;
  onExpressInterest?: (id: string) => void;
  onPass?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export function InvestorMatchCard({
  id,
  founderName,
  startupName,
  title,
  location,
  photoUrl,
  verified: _verified,
  linkedIn,
  matchScore,
  fundingStage,
  sector,
  raisingAmount,
  traction,
  matchReasons = [],
  consentedFields = [],
  dataRedacted = false,
  interestSent,
  passed,
  onExpressInterest,
  onPass,
  onViewDetail,
}: InvestorMatchCardProps) {
  const canShowIdentity = !dataRedacted && consentedFields.includes('identity');
  const canShowFinancials = !dataRedacted && consentedFields.includes('financials');
  const canShowTraction = !dataRedacted && consentedFields.includes('traction');

  const displayName = canShowIdentity ? (startupName ?? founderName) : 'Founder (pending consent)';

  return (
    <article
      className={[
        'relative bg-white border rounded-xl shadow-xs p-5 transition-shadow duration-normal',
        passed ? 'opacity-50' : 'hover:shadow-md',
        'border-neutral-200',
      ].join(' ')}
    >
      {interestSent && (
        <span className="absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full bg-warning-100 text-warning-700 border border-warning-200">
          Interest Sent
        </span>
      )}
      {passed && (
        <span className="absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
          Passed
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-14 w-14 shrink-0">
          {!dataRedacted && photoUrl && <AvatarImage src={photoUrl} alt={displayName} />}
          <AvatarFallback
            className={
              dataRedacted
                ? 'bg-neutral-200 text-neutral-400'
                : 'text-lg font-semibold bg-warning-100 text-warning-700'
            }
          >
            {dataRedacted ? <Lock className="h-5 w-5 text-neutral-400" aria-hidden="true" /> : initials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3
            className={[
              'text-md font-semibold leading-tight',
              dataRedacted ? 'text-neutral-400 italic' : 'text-neutral-900',
            ].join(' ')}
          >
            {displayName}
          </h3>
          {title && !dataRedacted && (
            <p className="text-sm text-neutral-500 truncate">{title}</p>
          )}
        </div>

        {matchScore !== undefined && !passed && (
          <MatchScoreArc score={matchScore} />
        )}
      </div>

      {/* Chips: location, stage, sector, trust */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {location && (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {location}
          </span>
        )}
        {fundingStage && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning-100 text-warning-700">
            {STAGE_LABELS[fundingStage] ?? fundingStage}
          </span>
        )}
        {sector && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
            {sector}
          </span>
        )}
        {linkedIn && <TrustBadgeT1 />}
      </div>

      {/* AI match reasons */}
      {matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {matchReasons.slice(0, 3).map((reason) => (
            <span
              key={reason}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200"
            >
              <Sparkles className="h-2.5 w-2.5 text-secondary-500" aria-hidden="true" />
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* Traction / Raising */}
      <div className="flex flex-wrap gap-4 text-sm mb-4">
        <div>
          <span className="text-neutral-400 text-xs uppercase tracking-wide block mb-0.5">Raising</span>
          {canShowFinancials && raisingAmount ? (
            <span className="text-neutral-900 font-medium">{raisingAmount}</span>
          ) : (
            <LockedField label="Not shared" />
          )}
        </div>
        <div>
          <span className="text-neutral-400 text-xs uppercase tracking-wide block mb-0.5">Traction</span>
          {canShowTraction && traction ? (
            <span className="text-neutral-900 font-medium">{traction}</span>
          ) : (
            <LockedField label="Not shared" />
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="primary"
          size="sm"
          disabled={!!interestSent || dataRedacted}
          title={dataRedacted ? 'Founder must enable investor visibility first' : undefined}
          onClick={() => onExpressInterest?.(id)}
        >
          Express Interest
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetail?.(id)}
        >
          View Details
        </Button>
        {!passed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPass?.(id)}
          >
            Pass
          </Button>
        )}
        {passed && (
          <button
            className="text-xs text-primary-600 hover:underline px-2"
            onClick={() => onPass?.(id)}
          >
            Undo
          </button>
        )}
      </div>
    </article>
  );
}
