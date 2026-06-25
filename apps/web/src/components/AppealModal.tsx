'use client';

import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const MAX_CHARS = 500;

interface AppealModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<{ referenceId: string }>;
  photoThumbUrl?: string;
}

type Phase = 'form' | 'submitting' | 'confirmed';

export function AppealModal({ open, onClose, onSubmit, photoThumbUrl }: AppealModalProps) {
  const [phase, setPhase] = useState<Phase>('form');
  const [reason, setReason] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setPhase('form');
      setReason('');
      setReferenceId('');
      setError('');
    }
  }, [open]);

  // Focus textarea on open (focus trap handled by Radix Dialog)
  useEffect(() => {
    if (open && phase === 'form') {
      const timer = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, phase]);

  async function handleSubmit() {
    if (!reason.trim()) {
      setError('Please describe why you believe this decision should be reconsidered.');
      return;
    }
    setError('');
    setPhase('submitting');
    try {
      const result = await onSubmit(reason.trim());
      setReferenceId(result.referenceId);
      setPhase('confirmed');
    } catch {
      setPhase('form');
      setError('Could not submit your appeal. Please try again.');
    }
  }

  const remaining = MAX_CHARS - reason.length;
  const overLimit = remaining < 0;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Panel — full-screen bottom sheet on mobile, centered dialog on desktop */}
        <Dialog.Content
          aria-describedby="appeal-desc"
          className={cn(
            'fixed z-50 bg-white shadow-xl outline-none',
            // Mobile: bottom sheet
            'bottom-0 left-0 right-0 rounded-t-2xl px-5 pt-5 pb-8',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            // Desktop: centered dialog
            'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:w-full sm:max-w-md sm:rounded-2xl sm:px-6 sm:py-6',
            'sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0',
            'sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95',
            'duration-200',
          )}
        >
          {/* Mobile drag handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" aria-hidden="true" />

          {phase !== 'confirmed' ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Dialog.Title className="text-lg font-semibold text-neutral-900">
                    Appeal photo rejection
                  </Dialog.Title>
                  <Dialog.Description id="appeal-desc" className="text-sm text-neutral-500 mt-0.5">
                    Explain why you believe this decision should be reconsidered.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors duration-[150ms]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Photo preview */}
              {photoThumbUrl && (
                <div className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <img
                    src={photoThumbUrl}
                    alt="Rejected photo"
                    className="h-12 w-12 rounded-md object-cover shrink-0"
                  />
                  <div>
                    <p className="text-xs font-medium text-neutral-700">Profile photo</p>
                    <p className="text-xs text-error-600 font-medium mt-0.5">Rejected</p>
                  </div>
                </div>
              )}

              {/* Reason textarea */}
              <div className="space-y-1.5 mb-4">
                <label htmlFor="appeal-reason" className="text-sm font-medium text-neutral-700">
                  Reason for appeal
                </label>
                <Textarea
                  id="appeal-reason"
                  ref={textareaRef}
                  rows={4}
                  maxLength={MAX_CHARS + 50}
                  placeholder="e.g. This is a professional headshot taken at my workplace…"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError('');
                  }}
                  className={cn(overLimit && 'border-error-500 focus:ring-error-500')}
                />
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs', overLimit ? 'text-error-600' : 'text-neutral-400')}>
                    {overLimit ? `${Math.abs(remaining)} over limit` : `${remaining} remaining`}
                  </span>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs text-error-600 bg-error-50 border border-error-200 rounded-md px-3 py-2 mb-4">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" size="md" onClick={onClose} disabled={phase === 'submitting'}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={phase === 'submitting' || overLimit || !reason.trim()}
                  aria-busy={phase === 'submitting'}
                >
                  {phase === 'submitting' ? 'Submitting…' : 'Submit appeal'}
                </Button>
              </div>
            </>
          ) : (
            /* Confirmation screen */
            <div className="flex flex-col items-center text-center py-4">
              <div className="h-14 w-14 rounded-full bg-success-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-success-600" aria-hidden="true" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-neutral-900 mb-1">
                Appeal submitted
              </Dialog.Title>
              <Dialog.Description className="text-sm text-neutral-500 mb-4">
                Our team will review your appeal within 2–3 business days.
              </Dialog.Description>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 mb-6 w-full">
                <p className="text-xs text-neutral-500 mb-0.5">Reference number</p>
                <p className="text-sm font-mono font-semibold text-neutral-800">{referenceId}</p>
              </div>
              <Button variant="primary" size="md" onClick={onClose} className="w-full sm:w-auto">
                Done
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
