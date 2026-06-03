'use client';

import { useState } from 'react';
import { ClipboardList, X, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface NudgeStep {
  label: string;
  href: string;
  done?: boolean;
}

interface NudgeCardProps {
  percent: number;
  stepsLeft: number;
  steps: NudgeStep[];
}

function progressColor(pct: number): string {
  if (pct < 40) return '#EF4444';
  if (pct < 65) return '#F59E0B';
  if (pct < 80) return '#14B8A6';
  return '#22C55E';
}

export function NudgeCard({ percent, stepsLeft, steps }: NudgeCardProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const color = progressColor(percent);
  const shown = steps.slice(0, 3);

  return (
    <div
      className="relative bg-primary-50 border border-primary-200 border-l-4 rounded-xl p-5 pl-6 mb-6"
      style={{ borderLeftColor: '#4F46E5' }}
      role="complementary"
      aria-label="Profile completion nudge"
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="h-5 w-5 text-primary-500 shrink-0" aria-hidden="true" />
        <span className="text-md font-semibold text-neutral-900">
          Complete your profile to improve your matches
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-1">
        <div className="h-2 rounded-full bg-primary-100 overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-neutral-600">You're {percent}% of the way there</span>
          <span className="text-xs text-neutral-400">{stepsLeft} steps left</span>
        </div>
      </div>

      {/* Steps */}
      <ul className="mt-3 space-y-2 mb-4" aria-label="Incomplete profile steps">
        {shown.map((step) => (
          <li key={step.label} className="flex items-center gap-2">
            <span
              className={[
                'h-5 w-5 rounded-full flex items-center justify-center shrink-0',
                step.done ? 'bg-success-500' : 'bg-neutral-200',
              ].join(' ')}
              aria-hidden="true"
            >
              {step.done && <Check className="h-3 w-3 text-white" />}
            </span>
            <span className="text-sm text-neutral-700 flex-1">{step.label}</span>
            {!step.done && (
              <Link href={step.href} className="text-sm text-primary-600 hover:underline shrink-0">
                Add now →
              </Link>
            )}
          </li>
        ))}
      </ul>
      {steps.length > 3 && (
        <Link href="/profile/edit" className="text-xs text-neutral-400 hover:underline">
          View all {steps.length} steps
        </Link>
      )}

      {/* CTA */}
      <div className="flex gap-3 mt-4 flex-wrap">
        <Button variant="primary" size="sm" asChild>
          <Link href="/profile/edit">Finish Profile</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          Remind me later
        </Button>
      </div>
    </div>
  );
}
