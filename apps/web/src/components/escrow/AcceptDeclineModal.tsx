'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Escrow } from '@/types/escrow';

interface AcceptDeclineModalProps {
  escrow: Escrow;
  initialMode?: 'accept' | 'decline';
  onClose: () => void;
  onAccepted: () => void;
  onDeclined: () => void;
}

export function AcceptDeclineModal({
  escrow,
  initialMode = 'accept',
  onClose,
  onAccepted,
  onDeclined,
}: AcceptDeclineModalProps) {
  const [mode, setMode] = useState<'accept' | 'decline'>(initialMode);
  const [declineReason, setDeclineReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
  }, [mode, onClose]);

  async function handleAccept() {
    setSubmitting(true);
    try {
      await fetch(`/api/escrow/${escrow.id}/accept`, { method: 'PATCH' });
    } catch { /* stub */ }
    onAccepted();
  }

  async function handleDecline() {
    setSubmitting(true);
    try {
      await fetch(`/api/escrow/${escrow.id}/decline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason }),
      });
    } catch { /* stub */ }
    onDeclined();
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
        aria-label={mode === 'accept' ? 'Accept escrow agreement' : 'Decline escrow agreement'}
        className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">
            {mode === 'accept' ? 'Accept agreement' : 'Decline agreement'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Mode switcher */}
          <div className="flex gap-2">
            {(['accept', 'decline'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  mode === m
                    ? m === 'accept'
                      ? 'border-success-500 bg-success-50 text-success-700'
                      : 'border-error-300 bg-error-50 text-error-700'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                {m === 'accept' ? 'Accept' : 'Decline'}
              </button>
            ))}
          </div>

          {/* Release conditions */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2">Release conditions</p>
            <div className="bg-neutral-50 border-l-4 border-l-primary-400 px-3 py-2.5 rounded-r-lg text-sm text-neutral-700">
              {escrow.releaseConditions}
            </div>
          </div>

          {/* Escrow summary */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">From</span>
              <span className="text-neutral-900 font-medium">{escrow.founder.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total held</span>
              <span className="text-neutral-900 font-semibold">{fmt(escrow.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Structure</span>
              <span className="text-neutral-900">
                {escrow.paymentStructure === 'milestone' ? `${escrow.milestones.length} milestones` : 'Single payment'}
              </span>
            </div>
          </div>

          {mode === 'decline' && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Reason (optional)</label>
              <textarea
                rows={3}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Let the founder know why you're declining…"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-5 py-4 border-t border-neutral-100 gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>Cancel</Button>
          {mode === 'accept' ? (
            <Button variant="success" size="sm" disabled={submitting} onClick={handleAccept}>
              {submitting ? 'Accepting…' : 'Accept agreement'}
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled={submitting} onClick={handleDecline}>
              {submitting ? 'Declining…' : 'Confirm decline'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
