'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Escrow } from '@/types/escrow';

const DISPUTE_REASONS = [
  'Work not delivered',
  'Deliverables do not meet agreed spec',
  'Communication breakdown',
  'Milestones not completed',
  'Quality below agreed standard',
  'Other',
];

interface DisputeModalProps {
  escrow: Escrow;
  mode: 'open' | 'respond';
  onClose: () => void;
  onSubmitted: () => void;
}

export function DisputeModal({ escrow, mode, onClose, onSubmitted }: DisputeModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isRespond = mode === 'respond';
  const canSubmit = description.trim().length >= 30 && (isRespond || reason !== '');

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

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const combined = [...prev, ...chosen];
      return combined.slice(0, 5);
    });
  }

  async function handleSubmit() {
    if (description.trim().length < 30) {
      setError('Please provide at least 30 characters of detail.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      if (!isRespond) fd.append('reason', reason);
      fd.append('description', description);
      files.forEach((f) => fd.append('evidence', f));

      const url = isRespond && escrow.dispute
        ? `/api/escrow/${escrow.id}/disputes/${escrow.dispute.id}/respond`
        : `/api/escrow/${escrow.id}/disputes`;

      await fetch(url, { method: 'POST', body: fd });
      onSubmitted();
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
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
        aria-label={isRespond ? 'Respond to dispute' : 'Open a dispute'}
        className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[90dvh]"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100 shrink-0">
          <h2 className="text-base font-semibold text-neutral-900">
            {isRespond ? 'Respond to dispute' : 'Open a dispute'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {!isRespond && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Reason for dispute</label>
              <select
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select a reason…</option>
                {DISPUTE_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {isRespond && escrow.dispute && (
            <div className="bg-error-50 border border-error-200 rounded-lg px-4 py-3 text-sm">
              <p className="font-medium text-error-700 mb-0.5">Dispute reason</p>
              <p className="text-error-600">{escrow.dispute.reason}</p>
              {escrow.dispute.description && (
                <p className="text-error-600 mt-1">{escrow.dispute.description}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              {isRespond ? 'Your response' : 'Description'}
              <span className="text-neutral-400 font-normal ml-1">(min. 30 characters)</span>
            </label>
            <textarea
              rows={5}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder={isRespond ? 'Provide your side of the story…' : 'Describe the issue in detail…'}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(''); }}
            />
            <p className="text-xs text-neutral-400 mt-0.5">{description.trim().length}/30 min</p>
          </div>

          {/* Evidence upload */}
          <div>
            <p className="text-xs font-medium text-neutral-700 mb-1">Evidence (optional, max 5 files)</p>
            <input ref={fileRef} type="file" multiple className="sr-only" onChange={handleFiles} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Paperclip className="h-4 w-4" /> Attach files
            </button>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-xs text-neutral-600 bg-neutral-50 rounded-lg px-3 py-1.5">
                    <span className="truncate max-w-[240px]">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))}
                      className="text-neutral-400 hover:text-error-600 ml-2"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-xs text-error-600">{error}</p>}
        </div>

        <div className="flex justify-between items-center px-5 py-4 border-t border-neutral-100 shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting…' : isRespond ? 'Submit response' : 'Open dispute'}
          </Button>
        </div>
      </div>
    </div>
  );
}
