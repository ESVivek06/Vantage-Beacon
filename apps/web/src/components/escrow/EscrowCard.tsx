'use client';

import { CheckCircle2, Clock, AlertTriangle, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, initials } from '@/lib/utils';
import type { Escrow, EscrowStatus } from '@/types/escrow';

const STATUS_CONFIG: Record<
  EscrowStatus,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  IN_PROGRESS:        { label: 'In progress',        badgeClass: 'bg-success-100 text-success-700 border border-success-200', icon: CheckCircle2 },
  ACCEPTED:           { label: 'Accepted',            badgeClass: 'bg-success-100 text-success-700 border border-success-200', icon: CheckCircle2 },
  INITIATED:          { label: 'Pending acceptance',  badgeClass: 'bg-warning-50 text-warning-700 border border-warning-200',  icon: Clock },
  MILESTONE_RELEASED: { label: 'Milestone released',  badgeClass: 'bg-success-100 text-success-700 border border-success-200', icon: CheckCircle2 },
  COMPLETED:          { label: 'Completed',           badgeClass: 'bg-neutral-100 text-neutral-600 border border-neutral-200', icon: CheckCircle2 },
  DECLINED:           { label: 'Declined',            badgeClass: 'bg-neutral-100 text-neutral-500 border border-neutral-200', icon: Clock },
  DISPUTED:           { label: 'Disputed',            badgeClass: 'bg-error-100 text-error-700 border border-error-200',       icon: AlertTriangle },
  RESOLVED:           { label: 'Resolved',            badgeClass: 'bg-neutral-100 text-neutral-600 border border-neutral-200', icon: CheckCircle2 },
  REFUNDED:           { label: 'Refunded',            badgeClass: 'bg-neutral-100 text-neutral-500 border border-neutral-200', icon: Banknote },
};

export interface EscrowCardProps {
  escrow: Escrow;
  viewerRole: 'founder' | 'counterparty';
  onViewDetails: (id: string) => void;
  onRelease?: (id: string) => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onRequestRelease?: (id: string) => void;
  onViewDispute?: (id: string) => void;
}

export function EscrowCard({
  escrow,
  viewerRole,
  onViewDetails,
  onRelease,
  onAccept,
  onDecline,
  onRequestRelease,
  onViewDispute,
}: EscrowCardProps) {
  const cfg = STATUS_CONFIG[escrow.status] ?? STATUS_CONFIG.INITIATED;
  const StatusIcon = cfg.icon;
  const isDisputed = escrow.status === 'DISPUTED';
  const isPending = escrow.status === 'INITIATED';

  const releasedMilestones = escrow.milestones.filter((m) => m.status === 'RELEASED').length;
  const totalMilestones = escrow.milestones.length;
  const progressPct = totalMilestones > 0 ? Math.round((releasedMilestones / totalMilestones) * 100) : 0;

  const nextPendingMilestone = escrow.milestones.find((m) => m.status === 'PENDING');

  const counterparty = viewerRole === 'founder' ? escrow.counterparty : escrow.founder;

  const formattedAmount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: escrow.currency,
    maximumFractionDigits: 0,
  }).format(escrow.totalAmount);

  return (
    <div
      className={cn(
        'bg-neutral-0 border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow',
        isDisputed ? 'border-error-300 bg-error-50' : 'border-neutral-200',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={counterparty.avatarUrl} alt={counterparty.name} />
            <AvatarFallback className="text-xs">{initials(counterparty.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {counterparty.name}
            </p>
            <p className="text-xs text-neutral-500">{counterparty.role}</p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full text-xs font-medium px-2 py-0.5 shrink-0',
            cfg.badgeClass,
          )}
        >
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
          {cfg.label.toUpperCase()}
        </span>
      </div>

      {/* Title + amount */}
      <p className="text-sm font-semibold text-neutral-900 mb-0.5">&ldquo;{escrow.title}&rdquo;</p>
      <p className="text-xs text-neutral-500 mb-3">
        {formattedAmount} ·{' '}
        {escrow.paymentStructure === 'milestone'
          ? `${totalMilestones} milestones`
          : 'Single payment'}
      </p>

      {/* Dispute banner */}
      {isDisputed && escrow.dispute && (
        <div className="mb-3 flex items-start gap-2 text-xs text-error-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Dispute opened {new Date(escrow.dispute.openedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · Ref: {escrow.dispute.ref} · Payments paused
          </span>
        </div>
      )}

      {/* Pending acceptance notice */}
      {isPending && viewerRole === 'counterparty' && (
        <p className="text-xs text-neutral-600 mb-3 italic">
          Release condition: {escrow.releaseConditions.slice(0, 80)}{escrow.releaseConditions.length > 80 ? '…' : ''}
        </p>
      )}

      {/* Milestone progress */}
      {escrow.paymentStructure === 'milestone' && totalMilestones > 0 && !isPending && (
        <div className="mb-3">
          <p className="text-xs text-neutral-500 mb-1">
            {nextPendingMilestone
              ? `Next: ${nextPendingMilestone.description}`
              : 'All milestones released'}
          </p>
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-success-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${releasedMilestones} of ${totalMilestones} milestones released`}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {releasedMilestones}/{totalMilestones} milestones released
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        {isDisputed ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(escrow.id)}>
              View details
            </Button>
            {escrow.dispute && (
              <Button variant="secondary" size="sm" onClick={() => onViewDispute?.(escrow.id)}>
                {viewerRole === 'counterparty' ? 'Respond to dispute' : 'View dispute'}
              </Button>
            )}
          </>
        ) : isPending && viewerRole === 'counterparty' ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(escrow.id)}>
              View full terms
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onDecline?.(escrow.id)}>
              Decline
            </Button>
            <Button variant="success" size="sm" onClick={() => onAccept?.(escrow.id)}>
              Accept
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(escrow.id)}>
              View details
            </Button>
            {viewerRole === 'founder' && nextPendingMilestone && (
              <Button variant="primary" size="sm" onClick={() => onRelease?.(escrow.id)}>
                Release{escrow.paymentStructure === 'milestone' ? ' next milestone' : ' payment'}
              </Button>
            )}
            {viewerRole === 'counterparty' && escrow.status === 'IN_PROGRESS' && (
              <Button variant="secondary" size="sm" onClick={() => onRequestRelease?.(escrow.id)}>
                Request release
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
