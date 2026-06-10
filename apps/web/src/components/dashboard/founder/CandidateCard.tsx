import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { initials, cn } from '@/lib/utils';
import { MapPin, Sparkles } from 'lucide-react';

export interface CandidateCardProps {
  id: string;
  name: string;
  title?: string;
  location?: string;
  skills?: string[];
  fitScore?: number;
  fitScoreFallback?: boolean;
  photoUrl?: string;
  onViewProfile?: (id: string) => void;
  onShortlist?: (id: string) => void;
}

function fitScoreColor(score: number) {
  if (score >= 85) return 'bg-success-100 text-success-700';
  if (score >= 65) return 'bg-amber-100 text-amber-700';
  return 'bg-neutral-100 text-neutral-600';
}

export function CandidateCard({
  id,
  name,
  title,
  location,
  skills = [],
  fitScore,
  fitScoreFallback,
  photoUrl,
  onViewProfile,
  onShortlist,
}: CandidateCardProps) {
  return (
    <article className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 hover:shadow-md transition-all duration-normal">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-12 w-12 shrink-0">
          {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
          <AvatarFallback className="text-sm bg-primary-100 text-primary-700 font-semibold">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{name}</p>
          {title && <p className="text-xs text-neutral-500 truncate mt-0.5">{title}</p>}
          {location && (
            <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              <span>{location}</span>
            </div>
          )}
        </div>
        {fitScoreFallback ? (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400 shrink-0">
            Score pending
          </span>
        ) : fitScore !== undefined ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
              fitScoreColor(fitScore),
            )}
            aria-label={`AI fit score: ${fitScore}%`}
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {fitScore}% fit
          </span>
        ) : null}
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skills.slice(0, 4).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
              {s}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-neutral-400">+{skills.length - 4} more</span>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={() => onViewProfile?.(id)}>
          View Profile
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onShortlist?.(id)}>
          Shortlist
        </Button>
      </div>
    </article>
  );
}
