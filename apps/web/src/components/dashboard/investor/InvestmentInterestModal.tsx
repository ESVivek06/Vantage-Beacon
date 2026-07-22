'use client';

import { useState } from 'react';
import { X, Calendar, FileText, Users, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface InterestPayload {
  targetId: string;
  interestType: 'meeting_request' | 'term_sheet_enquiry' | 'intro_request';
  note: string;
}

interface InvestmentInterestModalProps {
  targetId: string;
  targetStartupName?: string;
  targetFounderName: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: InterestPayload) => Promise<void>;
}

const INTEREST_TYPES = [
  {
    value: 'meeting_request' as const,
    icon: Calendar,
    label: 'Request a meeting',
    description: 'Schedule time with the founder to learn more',
  },
  {
    value: 'term_sheet_enquiry' as const,
    icon: FileText,
    label: 'Term sheet enquiry',
    description: 'Signal serious investment interest',
  },
  {
    value: 'intro_request' as const,
    icon: Users,
    label: 'Introduction via V.B',
    description: 'Get a warm intro through the platform',
  },
];

const MAX_NOTE = 280;

export function InvestmentInterestModal({
  targetId,
  targetStartupName,
  targetFounderName,
  open,
  onClose,
  onSubmit,
}: InvestmentInterestModalProps) {
  const [interestType, setInterestType] = useState<InterestPayload['interestType']>('meeting_request');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await onSubmit({ targetId, interestType, note });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const displayName = targetStartupName ?? targetFounderName;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal — desktop centered, mobile bottom sheet */}
      <div
        className={[
          'fixed z-50 bg-white overflow-y-auto',
          'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
          'md:w-full md:max-w-[520px] md:max-h-[90vh] md:rounded-2xl md:shadow-2xl',
          'max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:h-[92dvh]',
          'max-md:rounded-t-2xl max-md:animate-sheet-slide-up',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={`Express investment interest in ${displayName}`}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-300" aria-hidden="true" />
        </div>

        {/* Close button (desktop) */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 h-8 w-8 items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Express Investment Interest</h2>
            <p className="text-sm text-neutral-500 mt-1">
              A notification will be sent to <span className="font-medium text-neutral-700">{displayName}</span>.
              They can accept or decline your interest.
            </p>
          </div>

          {/* Interest type */}
          <fieldset>
            <legend className="text-sm font-medium text-neutral-700 mb-2">
              Interest type <span className="text-error-600">*</span>
            </legend>
            <div className="space-y-2">
              {INTEREST_TYPES.map(({ value, icon: Icon, label, description }) => (
                <label
                  key={value}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    interestType === value
                      ? 'bg-primary-50 border-primary-300 ring-1 ring-primary-300'
                      : 'bg-white border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  <input
                    type="radio"
                    name="interestType"
                    value={value}
                    checked={interestType === value}
                    onChange={() => setInterestType(value)}
                    className="sr-only"
                  />
                  <div className={cn(
                    'mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    interestType === value ? 'bg-primary-100' : 'bg-neutral-100',
                  )}>
                    <Icon className={cn('h-4 w-4', interestType === value ? 'text-primary-600' : 'text-neutral-500')} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{label}</p>
                    <p className="text-xs text-neutral-500">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Note */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="interest-note" className="text-sm font-medium text-neutral-700">
                Note <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <span className="text-xs text-neutral-400" aria-live="polite">
                {note.length} / {MAX_NOTE}
              </span>
            </div>
            <textarea
              id="interest-note"
              rows={3}
              maxLength={MAX_NOTE}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Briefly describe your interest or thesis fit..."
              className={cn(
                'w-full text-sm text-neutral-900 placeholder:text-neutral-400',
                'border border-neutral-200 rounded-lg px-3 py-2 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'transition-shadow',
              )}
            />
            <p className="text-xs text-neutral-400 mt-1">
              This will be shared with the founder if they accept your interest.
            </p>
          </div>

          {/* FCA Disclaimer — mandatory, always visible */}
          <div
            role="note"
            aria-label="Regulatory disclaimer"
            className="flex gap-2 bg-warning-50 border border-warning-200 rounded-md p-3 text-xs text-warning-700"
          >
            <TriangleAlert className="h-4 w-4 text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Not financial advice.</strong> Vantage Beacon facilitates introductions only and is not a regulated
              investment platform. Always conduct your own due diligence before making any investment decision.
            </span>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send Interest'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
