'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface AvailabilityToggleProps {
  defaultAvailable?: boolean;
  onChange?: (available: boolean) => void;
}

export function AvailabilityToggle({ defaultAvailable = false, onChange }: AvailabilityToggleProps) {
  const [available, setAvailable] = useState(defaultAvailable);

  const toggle = () => {
    const next = !available;
    setAvailable(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-neutral-700" id="availability-label">
        Available for work
      </span>
      <button
        role="switch"
        aria-checked={available}
        aria-labelledby="availability-label"
        onClick={toggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
          'border-2 border-transparent transition-colors duration-normal',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          available ? 'bg-success-500' : 'bg-neutral-300',
        )}
      >
        <span className="sr-only">{available ? 'Available' : 'Not available'}</span>
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm',
            'transition-transform duration-normal',
            available ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
      <span
        className={cn(
          'text-sm font-semibold',
          available ? 'text-success-600' : 'text-neutral-400',
        )}
        aria-live="polite"
      >
        {available ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}
