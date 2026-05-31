import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-sm border bg-neutral-0 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all',
          'focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:border-neutral-200 disabled:text-neutral-400',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error
            ? 'border-error-500 focus-visible:shadow-[0_0_0_3px_var(--color-error-100)]'
            : success
              ? 'border-success-500 focus-visible:shadow-[0_0_0_3px_var(--color-success-100)]'
              : 'border-neutral-300 focus-visible:border-primary-500 focus-visible:shadow-[0_0_0_3px_var(--color-primary-100)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
