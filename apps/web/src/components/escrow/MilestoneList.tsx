'use client';

import { CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EscrowMilestone } from '@/types/escrow';

interface MilestoneListProps {
  milestones: EscrowMilestone[];
  currency: string;
  viewerRole: 'founder' | 'counterparty';
  onRelease?: (milestoneId: string) => void;
  releasing?: string | null;
}

export function MilestoneList({
  milestones,
  currency,
  viewerRole,
  onRelease,
  releasing,
}: MilestoneListProps) {
  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  if (milestones.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-2">
        Single payment — no milestones.
      </p>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {milestones.map((m, idx) => (
        <div
          key={m.id}
          className="flex items-center gap-3 py-2.5 text-sm"
        >
          <span className="w-5 text-xs text-neutral-400 font-medium shrink-0">{idx + 1}</span>
          <span className="flex-1 text-neutral-800">{m.description}</span>
          <span className="text-neutral-700 font-medium shrink-0">{fmt(m.amount)}</span>
          {m.status === 'RELEASED' ? (
            <span className="flex items-center gap-1 text-success-600 font-medium shrink-0">
              <CheckCircle2
                className="h-3.5 w-3.5"
                aria-label="Released"
              />
              <span className="hidden sm:inline text-xs">
                Released{m.releasedAt ? ` ${new Date(m.releasedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
              </span>
            </span>
          ) : (
            <span className={cn('flex items-center gap-1 font-medium shrink-0 text-xs', viewerRole === 'founder' ? 'text-warning-600' : 'text-neutral-500')}>
              <Clock className="h-3.5 w-3.5" aria-label="Pending" />
              <span className="hidden sm:inline">Pending</span>
            </span>
          )}
          {viewerRole === 'founder' && m.status === 'PENDING' && onRelease && (
            <Button
              variant="secondary"
              size="xs"
              disabled={releasing === m.id}
              onClick={() => onRelease(m.id)}
              className="shrink-0 ml-1"
              aria-label={`Release ${fmt(m.amount)} to counterparty`}
            >
              {releasing === m.id ? 'Releasing…' : 'Release'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
