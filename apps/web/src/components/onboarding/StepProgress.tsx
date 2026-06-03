'use client';

import { Check } from 'lucide-react';

interface StepProgressProps {
  steps: string[];
  current: number; // 0-indexed
}

export function StepProgress({ steps, current }: StepProgressProps) {
  return (
    <div className="flex items-center w-full" role="list" aria-label="Onboarding steps">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none" role="listitem">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                  done ? 'bg-primary-100' : active ? 'bg-primary-600 text-white shadow-xs' : 'bg-neutral-200 text-neutral-400',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                {done ? (
                  <Check className="h-3 w-3 text-primary-600" aria-hidden="true" />
                ) : (
                  <span className={active ? 'text-white' : 'text-neutral-400 text-xs font-medium'}>{i + 1}</span>
                )}
              </div>
              <span className="text-xs font-medium text-neutral-600 hidden sm:block">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-1 mb-5" style={{ background: i < current ? '#A5B4FC' : '#E2E8F0' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
