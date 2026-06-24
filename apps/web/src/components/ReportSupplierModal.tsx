'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ReportSupplierModalProps {
  supplierId: string;
  supplierName: string;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const REASONS = [
  'Misleading information',
  'Poor quality of work',
  'Unprofessional behaviour',
  'Late or failed delivery',
  'Other',
] as const;

type Reason = (typeof REASONS)[number];

function StepDots({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-0">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-[250ms]',
              i + 1 === current
                ? 'h-2 w-6 bg-primary-600'
                : 'h-2 w-2 bg-neutral-200',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-400 font-medium">
        Step {current} of {total}
      </span>
    </div>
  );
}

export function ReportSupplierModal({ supplierId, supplierName, onClose }: ReportSupplierModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const MAX_DETAILS = 500;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch(`/api/suppliers/${supplierId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details: details.trim() || undefined }),
      });
    } catch {
      // proceed to confirmation even on error — no blocking UX
    } finally {
      setSubmitting(false);
      setStep(3);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[520px] mx-4 bg-neutral-0 rounded-2xl shadow-2xl animate-modal-mount"
        role="dialog"
        aria-modal="true"
        aria-label="Report supplier"
      >
        {step === 1 && (
          <>
            <StepDots current={1} total={3} />
            <div className="p-6 pt-4">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold text-neutral-900">Report Supplier</h2>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-neutral-500 mb-5">Help us keep V.B a trusted platform.</p>

              <p className="text-sm font-semibold text-neutral-700 mb-3">What&apos;s the issue?</p>

              <div className="space-y-2 mb-6">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors duration-[150ms]',
                      reason === r
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50',
                    )}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-primary-600"
                    />
                    <span className="text-sm text-neutral-800">{r}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!reason}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepDots current={2} total={3} />
            <div className="p-6 pt-4">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold text-neutral-900">Tell us more (optional)</h2>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-neutral-500 mb-5">
                We won&apos;t share this with the supplier.
              </p>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, MAX_DETAILS))}
                rows={5}
                placeholder="Describe what happened..."
                className="w-full rounded-lg border border-neutral-200 text-sm px-3 py-2.5 resize-none focus:outline-none focus:border-primary-500 focus:shadow-focus-ring placeholder:text-neutral-400"
                aria-label="Additional details"
              />
              <div className="text-xs text-neutral-400 text-right mt-1 mb-6">
                {details.length} / {MAX_DETAILS}
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Submitting…' : 'Submit report'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle2
              className="h-16 w-16 text-success-500 mb-4 animate-scale-in"
              aria-hidden="true"
            />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Report submitted</h2>
            <p className="text-sm text-neutral-500 mb-8 max-w-[320px]">
              Thank you — our team will review this within 48 hours.
            </p>
            <Button variant="primary" size="sm" onClick={onClose}>
              Back to profile
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
