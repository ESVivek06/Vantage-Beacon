'use client';

import { useState } from 'react';
import { UserCircle2, X } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompletionToastProps {
  percent: number;
  onDismiss?: () => void;
}

export function ProfileCompletionToast({ percent, onDismiss }: ProfileCompletionToastProps) {
  const [dismissed, setDismissed] = useState(false);

  function dismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-90 max-w-[calc(100vw-2rem)] rounded-lg bg-neutral-900 shadow-xl p-4 pl-5 animate-toast-slide-in overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <UserCircle2 className="h-5 w-5 text-primary-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-0">
            Your profile is {percent}% complete
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Complete it to improve your match quality.
          </p>
          <Link
            href="/profile/edit"
            className="text-xs font-semibold text-primary-300 underline mt-2 block hover:text-primary-200"
          >
            Complete now
          </Link>
        </div>
        <button
          onClick={dismiss}
          className="h-6 w-6 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Auto-dismiss drain bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-neutral-700">
        <div className="h-full bg-primary-400 animate-drain" onAnimationEnd={dismiss} />
      </div>
    </div>
  );
}
