'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupplierDisputeBannerProps {
  supplierId: string;
  onReport: () => void;
}

const STORAGE_KEY_PREFIX = 'vb_dispute_dismissed_';

export function SupplierDisputeBanner({ supplierId, onReport }: SupplierDisputeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${supplierId}`);
      if (stored === 'true') setDismissed(true);
    } catch {
      // localStorage unavailable
    }
  }, [supplierId]);

  function handleDismiss() {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${supplierId}`, 'true');
    } catch {
      // localStorage unavailable
    }
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg mb-6',
        'bg-amber-50 border border-amber-200 border-l-4 border-l-accent-500',
        'shadow-xs',
        'dark:bg-[#1c1400] dark:border-amber-700 dark:border-l-accent-500',
      )}
    >
      <AlertTriangle
        className="h-5 w-5 text-accent-600 shrink-0 mt-0.5"
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          A concern has been raised about this supplier.
        </p>
        <p className="text-xs text-neutral-600 mt-0.5 dark:text-neutral-300">
          Review before engaging.
        </p>
      </div>

      <button
        onClick={onReport}
        aria-label="Report this supplier"
        className="px-2 py-1 text-sm font-medium text-error-600 hover:text-error-700 hover:underline transition-colors duration-[150ms] shrink-0"
      >
        Report
      </button>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss warning"
        className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-amber-100 transition-colors duration-[150ms] shrink-0"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
