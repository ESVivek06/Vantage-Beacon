'use client';

import { Clock, CheckCircle2, XCircle, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'appealing';

interface ModerationBannerProps {
  status: ModerationStatus;
  onAppeal?: () => void;
  onDismiss?: () => void;
  referenceId?: string;
  className?: string;
}

const VARIANTS = {
  pending: {
    Icon: Clock,
    role: 'status' as const,
    borderClass: 'border-l-warning-500',
    bgClass: 'bg-warning-50 border-warning-200',
    iconClass: 'text-warning-600',
    heading: 'Photo under review',
    body: 'Your photo is being scanned. This usually takes under a minute.',
    cta: null,
  },
  approved: {
    Icon: CheckCircle2,
    role: 'status' as const,
    borderClass: 'border-l-success-600',
    bgClass: 'bg-success-50 border-success-200',
    iconClass: 'text-success-600',
    heading: 'Photo approved',
    body: 'Your photo passed our review and is now visible on your profile.',
    cta: null,
  },
  rejected: {
    Icon: XCircle,
    role: 'alert' as const,
    borderClass: 'border-l-error-500',
    bgClass: 'bg-error-50 border-error-200',
    iconClass: 'text-error-600',
    heading: 'Photo rejected',
    body: 'Your photo did not meet our community guidelines. You can appeal this decision.',
    cta: 'Appeal decision',
  },
  appealing: {
    Icon: RotateCcw,
    role: 'status' as const,
    borderClass: 'border-l-primary-500',
    bgClass: 'bg-primary-50 border-primary-200',
    iconClass: 'text-primary-600',
    heading: 'Appeal submitted',
    body: 'Our team is reviewing your appeal. We\'ll notify you of the outcome.',
    cta: null,
  },
} as const;

export function ModerationBanner({
  status,
  onAppeal,
  onDismiss,
  referenceId,
  className,
}: ModerationBannerProps) {
  const v = VARIANTS[status];
  const { Icon } = v;

  return (
    <div
      role={v.role}
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border border-l-4',
        v.bgClass,
        v.borderClass,
        'shadow-xs',
        className,
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', v.iconClass)} aria-hidden="true" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900">{v.heading}</p>
        <p className="text-xs text-neutral-600 mt-0.5">{v.body}</p>
        {referenceId && (
          <p className="text-xs text-neutral-500 mt-1">
            Reference: <span className="font-mono">{referenceId}</span>
          </p>
        )}
      </div>

      {v.cta && onAppeal && (
        <button
          type="button"
          onClick={onAppeal}
          className="shrink-0 px-2.5 py-1 text-xs font-semibold rounded-md text-error-700 bg-error-100 hover:bg-error-200 transition-colors duration-[150ms]"
        >
          {v.cta}
        </button>
      )}

      {onDismiss && status === 'approved' && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="h-7 w-7 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-black/5 transition-colors duration-[150ms] shrink-0"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
