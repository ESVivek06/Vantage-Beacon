'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Paperclip, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Escrow } from '@/types/escrow';

const DISPUTE_REASONS = [
  'Work not delivered',
  'Quality issues',
  'Terms not met',
  'Scope creep',
  'Payment error',
  'Other',
] as const;

type DisputeReason = (typeof DISPUTE_REASONS)[number];

interface DisputeModalProps {
  escrow: Escrow;
  mode: 'open' | 'respond';
  disputeId?: string;
  onClose: () => void;
  onDone: () => void;
}

export function DisputeModal({ escrow, mode, disputeId, onClose, onDone }: DisputeModalProps) {
  const [reason, setReason] = useState<DisputeReason | ''>('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 1000;
  const MIN_CHARS = 30;

  const isOpen = mode === 'open';
  const canSubmit = isOpen
    ? reason !== '' && description.trim().length >= MIN_CHARS
    : description.trim().length >= MIN_CHARS;

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
    e.target.value = '';
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (isOpen) formData.append('reason', reason);
      formData.append('description', description.trim());
      files.forEach((f) => formData.append('evidence', f));

      const url = isOpen
        ? `/api/escrow/${escrow.id}/disputes`
        : `/api/escrow/${escrow.id}/disputes/${disputeId}/respond`;
      const method = isOpen ? 'POST' : 'POST';

      await fetch(url, { method, body: formData });
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 bg-neutral-0 rounded-2xl shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-label={isOpen ? 'Open a dispute' : 'Respond to dispute'}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">
            {isOpen ? 'Open a dispute' : 'Respond to dispute'}
          </h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-500 mb-4">
          Escrow: &ldquo;{escrow.title}&rdquo; · {fmt(escrow.totalAmount)}
        </p>

        {/* Reason select — open only */}
        {isOpen && (
          <div className="mb-4">
            <label htmlFor="dispute-reason" className="block text-sm font-medium text-neutral-700 mb-1">
              Reason for dispute *
            </label>
            <select
              id="dispute-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              className="flex h-10 w-full rounded-sm border border-neutral-300 bg-neutral-0 px-3 text-sm text-neutral-900 focus-visible:outline-none focus-visible:border-primary-500"
            >
              <option value="">Select a reason…</option>
              {DISPUTE_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* Description textarea */}
        <div className="mb-4">
          <label htmlFor="dispute-desc" className="block text-sm font-medium text-neutral-700 mb-1">
            {isOpen ? 'Describe the issue *' : 'Your response *'}
          </label>
          <textarea
            id="dispute-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHARS))}
            rows={4}
            placeholder={isOpen ? 'Describe what happened in detail…' : 'Provide your response…'}
            className={cn(
              'w-full rounded-sm border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none focus:border-primary-500',
              description.trim().length > 0 && description.trim().length < MIN_CHARS
                ? 'border-warning-400'
                : 'border-neutral-300',
            )}
          />
          <div className="flex items-center justify-between mt-1">
            <span className={cn('text-xs', description.trim().length > 0 && description.trim().length < MIN_CHARS ? 'text-warning-600' : 'text-neutral-400')}>
              Minimum {MIN_CHARS} characters
            </span>
            <span className="text-xs text-neutral-400">{description.length} / {MAX_CHARS}</span>
          </div>
        </div>

        {/* File attachments */}
        <div className="mb-4">
          <p className="text-sm font-medium text-neutral-700 mb-2">Supporting evidence (optional)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
            aria-label="Attach evidence files"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= 5}
            className="flex items-center gap-1.5"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Attach files
          </Button>
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG, PDF — max 10 MB each, up to 5</p>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-1.5 flex gap-2 items-center text-xs text-neutral-700"
                >
                  {f.name}
                  <button onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info notice */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex gap-2 mb-6">
          <Info className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-neutral-600">
            {isOpen
              ? 'Opening a dispute pauses any pending payments. Both parties will be notified and a V.B mediator may reach out within 3 business days.'
              : 'Your response will be visible to both parties and the V.B mediator.'}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={isOpen ? 'danger' : 'primary'}
            size="md"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? (isOpen ? 'Opening…' : 'Submitting…')
              : (isOpen ? 'Open dispute' : 'Submit response')}
          </Button>
        </div>
      </div>
    </>
  );
}
