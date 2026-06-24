'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Escrow } from '@/types/escrow';

interface AcceptDeclineModalProps {
  escrow: Escrow;
  mode: 'accept' | 'decline';
  onClose: () => void;
  onDone: () => void;
}

export function AcceptDeclineModal({ escrow, mode, onClose, onDone }: AcceptDeclineModalProps) {
  const [view, setView] = useState<'main' | 'decline-form'>(mode === 'decline' ? 'decline-form' : 'main');
  const [declineReason, setDeclineReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: escrow.currency,
      maximumFractionDigits: 0,
    }).format(amount);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape' && !submitting) onClose(); }
    document.addEventListener('keydown', onEsc);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose, submitting]);

  async function handleAccept() {
    setSubmitting(true);
    try {
      await fetch(`/api/escrow/${escrow.id}/accept`, { method: 'PATCH' });
      onDone();
    } catch {
      setSubmitting(false);
    }
  }

  async function handleDecline() {
    setSubmitting(true);
    try {
      await fetch(`/api/escrow/${escrow.id}/decline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason.trim() || undefined }),
      });
      onDone();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] z-40"
        onClick={submitting ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 bg-neutral-0 rounded-2xl shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-label={view === 'main' ? 'Accept escrow' : 'Decline escrow'}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">
            {view === 'main' ? 'Accept this escrow?' : 'Decline escrow'}
          </h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {view === 'main' && (
          <>
            <div className="space-y-1 mb-4 text-sm">
              <p className="text-neutral-700">
                <span className="font-medium">From:</span> {escrow.founder.name}
              </p>
              <p className="text-neutral-700">
                <span className="font-medium">Project:</span> &ldquo;{escrow.title}&rdquo;
              </p>
              <p className="text-neutral-700">
                <span className="font-medium">Amount:</span> {fmt(escrow.totalAmount)}{' '}
                ({escrow.paymentStructure === 'single' ? 'single payment' : `${escrow.milestones.length} milestones`})
              </p>
            </div>

            <div className={cn(
              'rounded-r-xl rounded-l p-3 text-sm text-neutral-700 italic mb-4',
              'bg-neutral-50 border-l-4 border-l-primary-400',
            )}>
              <p className="text-xs text-neutral-500 font-medium not-italic mb-1">Release conditions:</p>
              &ldquo;{escrow.releaseConditions}&rdquo;
            </div>

            <p className="text-xs text-neutral-500 mb-6">
              By accepting, you agree that payment will only be released once the conditions above are fulfilled.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                size="md"
                className="text-error-600 hover:text-error-700"
                onClick={() => setView('decline-form')}
              >
                Decline
              </Button>
              <Button variant="success" size="md" disabled={submitting} onClick={handleAccept}>
                {submitting ? 'Accepting…' : 'Accept escrow ✓'}
              </Button>
            </div>
          </>
        )}

        {view === 'decline-form' && (
          <>
            <p className="text-sm text-neutral-500 mb-3">
              Let {escrow.founder.name} know why you&apos;re declining (optional).
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
              placeholder="Reason for declining…"
              className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none focus:border-primary-500 mb-6"
              aria-label="Reason for declining"
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={mode === 'decline' ? onClose : () => setView('main')}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" disabled={submitting} onClick={handleDecline}>
                {submitting ? 'Declining…' : 'Decline escrow'}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
