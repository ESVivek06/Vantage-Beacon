import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium text-xs px-2 py-0.5 transition-colors',
  {
    variants: {
      variant: {
        // V.B spec variants
        primary: 'bg-primary-100 text-primary-700 border border-primary-200',
        secondary: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
        accent: 'bg-accent-100 text-accent-700 border border-accent-200',
        success: 'bg-success-100 text-success-700 border border-success-100',
        error: 'bg-error-100 text-error-700 border border-error-100',
        warning: 'bg-warning-50 text-warning-600 border border-warning-50',
        neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
        outline: 'border border-neutral-300 text-neutral-700',
        // Trust tiers
        'trust-t0': 'bg-trust-t0-bg text-trust-t0-text border border-trust-t0-border',
        'trust-t1': 'bg-trust-t1-bg text-trust-t1-text border border-trust-t1-border',
        // Status
        open: 'bg-success-100 text-success-700',
        closed: 'bg-neutral-100 text-neutral-500',
        urgent: 'bg-accent-100 text-accent-700',
        pending: 'bg-accent-100 text-accent-700',
        new: 'bg-primary-100 text-primary-700',
        // Backward compat
        default: 'bg-primary-100 text-primary-700 border border-primary-200',
        destructive: 'bg-error-100 text-error-700',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
