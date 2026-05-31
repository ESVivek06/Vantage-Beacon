import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Button } from './ui/button';
import { formatRelative } from '@/lib/utils';

export interface OpportunityCardProps {
  id: string;
  title: string;
  posterName?: string;
  role?: string;
  domain?: string;
  location?: string;
  description?: string;
  skills?: string[];
  budget?: string;
  status?: 'open' | 'closed' | 'urgent' | 'pending';
  postedAt?: string;
  featured?: boolean;
  compact?: boolean;
}

const statusConfig = {
  open: { label: 'Open', className: 'bg-success-100 text-success-700' },
  closed: { label: 'Closed', className: 'bg-neutral-100 text-neutral-500' },
  urgent: { label: 'Urgent', className: 'bg-accent-100 text-accent-700' },
  pending: { label: 'Pending', className: 'bg-accent-100 text-accent-700' },
};

export function OpportunityCard({
  id,
  title,
  posterName,
  role,
  domain,
  location,
  description,
  skills = [],
  budget,
  status = 'open',
  postedAt,
  featured,
  compact,
}: OpportunityCardProps) {
  const statusCfg = statusConfig[status];
  const accentColor = featured || status === 'urgent' ? 'border-l-accent-500' : 'border-l-primary-600';

  if (compact) {
    return (
      <Link
        href={`/opportunities/${id}`}
        className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">{title}</p>
          {posterName && <p className="text-xs text-neutral-500">{posterName}</p>}
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.className}`}>
          {statusCfg.label}
        </span>
      </Link>
    );
  }

  return (
    <article
      className={`bg-neutral-0 border border-neutral-200 border-l-4 ${accentColor} rounded-lg shadow-sm p-5 hover:shadow-md transition-all duration-normal`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-md font-semibold text-neutral-900 leading-tight">{title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {(featured || status === 'urgent') && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">
              <Zap className="h-3 w-3" />
              Urgent
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Sub-header */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
        {posterName && <span>{posterName}</span>}
        {role && <span>· {role}</span>}
        {postedAt && <span>· {formatRelative(postedAt)}</span>}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-neutral-600 line-clamp-3 mb-3">{description}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {skills.slice(0, 3).map((skill) => (
          <span key={skill} className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
            {skill}
          </span>
        ))}
        {domain && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
            {domain}
          </span>
        )}
        {budget && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
            {budget}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/opportunities/${id}`}>View Details</Link>
        </Button>
        <Button variant="primary" size="sm" asChild>
          <Link href={`/opportunities/${id}`}>Apply</Link>
        </Button>
      </div>
    </article>
  );
}
