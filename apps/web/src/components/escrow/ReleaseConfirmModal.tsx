'use client';

import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EscrowMilestone } from '@/types/escrow';

interface ReleaseConfirmModalProps {
  escrowId: string;
  milestone: EscrowMilestone | null;
  currency: string;
  counterpartyName: string;
  onClose: () => void;
  onReleased: () => void;
}

export function ReleaseConfirmModal({
  escrowId,
  milestone,
  currency,
  counterpartyName,
  onClose,
  onReleased,
}: ReleaseConfirmModalProps) {
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape' && !releasing) onClose(); }
    document.addEventListener('keydown', onEsc);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose, releasing]);

  async function handleRelease() {
    if (!milestone) return;
    setReleasing(true);
    try {
      await fetch(`/api/escrow/${escrowId}/milestones/${milestone.id}/release`, { method: 'POST' });
      setReleased(true);
      setTimeout(onReleased, 1200);
    } catch {
      setReleasing(false);
    }
  }

  if (!milestone) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] z-40"
        onClick={releasing ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 bg-neutral-0 rounded-2xl shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Release milestone payment"
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Release milestone payment?</h2>
          {!releasing && (
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-1 mb-4 text-sm">
          <p className="text-neutral-700">
            <span className="font-medium">Milestone:</span> {milestone.description}
          </p>
          <p className="text-neutral-700">
            <span className="font-medium">Amount:</span> {fmt(milestone.amount)}
          </p>
          <p className="text-neutral-700">
            <span className="font-medium">To:</span> {counterpartyName}
          </p>
        </div>

        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 flex gap-2 mb-6">
          <AlertTriangle className="h-4 w-4 text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-warning-700">
            This action cannot be undone. Once released, the payment will be processed to{' '}
            {counterpartyName}&apos;s connected account.
          </p>
        </div>

        {released ? (
          <p className="text-sm text-success-700 font-medium text-center py-2">
            Payment released to {counterpartyName} — {fmt(milestone.amount)} ✓
          </p>
        ) : (
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="md" onClick={onClose} disabled={releasing}>
              Cancel
            </Button>
            <Button
              variant="success"
              size="md"
              disabled={releasing}
              onClick={handleRelease}
              aria-label={`Release ${fmt(milestone.amount)} to ${counterpartyName}`}
            >
              {releasing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                  Releasing…
                </span>
              ) : (
                `Release ${fmt(milestone.amount)} →`
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
