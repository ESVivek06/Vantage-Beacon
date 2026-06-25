'use client';

import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Escrow, EscrowMilestone } from '@/types/escrow';

interface ReleaseConfirmModalProps {
  escrow: Escrow;
  milestone: EscrowMilestone;
  onClose: () => void;
  onReleased: () => void;
}

export function ReleaseConfirmModal({ escrow, milestone, onClose, onReleased }: ReleaseConfirmModalProps) {
  const [releasing, setReleasing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: escrow.currency, maximumFractionDigits: 0 }).format(v);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();
    function trap(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === focusable[0]) { e.preventDefault(); last?.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); focusable[0]?.focus(); } }
    }
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [onClose]);

  async function handleRelease() {
    setReleasing(true);
    try {
      await fetch(`/api/escrow/${escrow.id}/milestones/${milestone.id}/release`, { method: 'POST' });
    } catch {
      // stub
    }
    onReleased();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Release milestone payment"
        className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Release payment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="bg-warning-50 border border-warning-200 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-warning-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>This action is irreversible. Funds will be transferred to <strong>{escrow.counterparty.name}</strong> immediately.</span>
          </div>

          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Milestone</span>
              <span className="text-neutral-900 font-medium">{milestone.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Amount</span>
              <span className="text-neutral-900 font-semibold text-base">{fmt(milestone.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Recipient</span>
              <span className="text-neutral-900">{escrow.counterparty.name}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-5 py-4 border-t border-neutral-100 gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={releasing}>Cancel</Button>
          <Button variant="success" size="sm" disabled={releasing} onClick={handleRelease}>
            {releasing ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Releasing…
              </span>
            ) : (
              `Release ${fmt(milestone.amount)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
