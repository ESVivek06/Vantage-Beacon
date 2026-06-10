import { cn, initials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface KanbanCardProps {
  id: string;
  name: string;
  title?: string;
  photoUrl?: string;
  fitScore?: number;
  status: string;
  tags?: string[];
}

interface KanbanCardRenderProps extends KanbanCardProps {
  color?: string;
  dragging?: boolean;
}

function fitScoreBg(score: number) {
  if (score >= 85) return '#22C55E';
  if (score >= 65) return '#F59E0B';
  return '#94A3B8';
}

export function KanbanCard({
  name,
  title,
  photoUrl,
  fitScore,
  tags = [],
  color,
  dragging = false,
}: KanbanCardRenderProps) {
  return (
    <article
      className={cn(
        'bg-white rounded-lg border border-neutral-200 shadow-xs p-3 cursor-grab select-none',
        'hover:shadow-md transition-shadow duration-normal',
        dragging && 'shadow-lg rotate-1 opacity-90',
      )}
      style={color ? { borderLeftWidth: 3, borderLeftColor: color, borderLeftStyle: 'solid' } : undefined}
      aria-label={`${name}${fitScore !== undefined ? `, fit score ${fitScore}%` : ''}`}
    >
      <div className="flex items-start gap-2">
        <Avatar className="h-8 w-8 shrink-0">
          {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
          <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{name}</p>
          {title && <p className="text-xs text-neutral-500 truncate">{title}</p>}
        </div>
        {fitScore !== undefined && (
          <span
            className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: fitScoreBg(fitScore) }}
            aria-label={`Fit score ${fitScore}%`}
          >
            {fitScore}%
          </span>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
