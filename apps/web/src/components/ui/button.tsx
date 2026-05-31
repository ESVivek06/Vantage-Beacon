'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 active:scale-[0.98] shadow-xs focus-visible:shadow-focus-ring',
        secondary:
          'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 active:bg-primary-100 active:scale-[0.98] focus-visible:shadow-focus-ring',
        ghost:
          'text-neutral-700 border border-neutral-200 hover:bg-neutral-100 active:bg-neutral-200 active:scale-[0.98] focus-visible:shadow-focus-ring',
        danger:
          'bg-error-600 text-white hover:bg-error-500 active:bg-error-700 active:scale-[0.98] shadow-xs focus-visible:shadow-focus-ring',
        success:
          'bg-success-600 text-white hover:bg-success-500 active:bg-success-700 active:scale-[0.98] shadow-xs focus-visible:shadow-focus-ring',
        link: 'text-primary-600 underline-offset-4 hover:underline p-0 h-auto',
        // Backward-compat aliases
        default:
          'bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 active:scale-[0.98] shadow-xs focus-visible:shadow-focus-ring',
        destructive: 'bg-error-600 text-white hover:bg-error-500 active:scale-[0.98] shadow-xs',
        outline:
          'text-neutral-700 border border-neutral-200 bg-white hover:bg-neutral-100 active:scale-[0.98]',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-sm gap-1',
        sm: 'h-9 px-3.5 text-sm rounded-md gap-1.5',
        md: 'h-10 px-4 text-sm rounded-md gap-2',
        lg: 'h-11 px-5 text-md rounded-md gap-2',
        xl: 'h-13 px-6 text-lg font-semibold rounded-lg gap-2',
        icon: 'h-10 w-10 rounded-md',
        'icon-sm': 'h-9 w-9 rounded-md',
        // Backward-compat
        default: 'h-10 px-4 text-sm rounded-md gap-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
