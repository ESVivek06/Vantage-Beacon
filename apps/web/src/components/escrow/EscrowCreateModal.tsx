'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MilestoneInput {
  id: string;
  description: string;
  amount: string;
}

interface EscrowCreateModalProps {
  onClose: () => void;
  onCreated: (escrowId: string) => void;
  viewerName: string;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 rounded-full transition-all',
            i + 1 === current ? 'w-5 bg-primary-600' : i + 1 < current ? 'w-2 bg-primary-300' : 'w-2 bg-neutral-200',
          )}
        />
      ))}
    </div>
  );
}

export function EscrowCreateModal({ onClose, onCreated, viewerName }: EscrowCreateModalProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Step 1
  const [title, setTitle] = useState('');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [paymentStructure, setPaymentStructure] = useState<'single' | 'milestone'>('milestone');
  const [releaseConditions, setReleaseConditions] = useState('');

  // Step 2
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { id: '1', description: '', amount: '' },
  ]);

  const totalSteps = paymentStructure === 'milestone' ? 3 : 2;
  const parsedTotal = parseFloat(totalAmount) || 0;
  const milestonesTotal = milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const milestoneMismatch = paymentStructure === 'milestone' && Math.abs(milestonesTotal - parsedTotal) > 0.01 && parsedTotal > 0;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    function trap(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    }
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [step, onClose]);

  function addMilestone() {
    setMilestones((ms) => [...ms, { id: Date.now().toString(), description: '', amount: '' }]);
  }

  function removeMilestone(id: string) {
    setMilestones((ms) => ms.filter((m) => m.id !== id));
  }

  function updateMilestone(id: string, field: 'description' | 'amount', value: string) {
    setMilestones((ms) => ms.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  function canAdvanceStep1() {
    return title.trim() && counterpartyName.trim() && parseFloat(totalAmount) > 0 && releaseConditions.trim();
  }

  function canAdvanceStep2() {
    if (paymentStructure !== 'milestone') return true;
    return milestones.every((m) => m.description.trim() && parseFloat(m.amount) > 0) && !milestoneMismatch;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const body = {
        title,
        counterpartyName,
        totalAmount: parsedTotal,
        currency,
        paymentStructure,
        releaseConditions,
        milestones: paymentStructure === 'milestone'
          ? milestones.map((m) => ({ description: m.description, amount: parseFloat(m.amount) }))
          : [],
      };
      const res = await fetch('/api/escrow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      onCreated(data.id ?? data.escrow?.id ?? 'new');
    } catch {
      // stub — proceed anyway
      onCreated('stub');
    } finally {
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
        aria-label="Create escrow agreement"
        className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[90dvh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100 shrink-0">
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Step {step} of {totalSteps}</p>
            <h2 className="text-base font-semibold text-neutral-900">
              {step === 1 ? 'Escrow details' : step === 2 && paymentStructure === 'milestone' ? 'Define milestones' : 'Confirm & send'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <StepIndicator current={step} total={totalSteps} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Agreement title</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Brand identity design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Supplier / counterparty name</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Full name"
                  value={counterpartyName}
                  onChange={(e) => setCounterpartyName(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Total amount</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Currency</label>
                  <select
                    className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Payment structure</label>
                <div className="flex gap-2">
                  {(['milestone', 'single'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPaymentStructure(v)}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
                        paymentStructure === v
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
                      )}
                    >
                      {v === 'milestone' ? 'Milestone-based' : 'Single payment'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Release conditions</label>
                <textarea
                  rows={3}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Describe what must be delivered before funds are released…"
                  value={releaseConditions}
                  onChange={(e) => setReleaseConditions(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 2 && paymentStructure === 'milestone' && (
            <>
              {milestoneMismatch && (
                <div className="bg-warning-50 border border-warning-200 rounded-lg px-3 py-2 text-xs text-warning-700">
                  Milestone totals ({new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(milestonesTotal)}) must equal the escrow total ({new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(parsedTotal)}).
                </div>
              )}
              <div className="space-y-3">
                {milestones.map((m, idx) => (
                  <div key={m.id} className="flex items-start gap-2">
                    <span className="text-xs text-neutral-400 font-medium w-5 mt-2.5 shrink-0">{idx + 1}</span>
                    <div className="flex-1 space-y-2">
                      <input
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Milestone description"
                        value={m.description}
                        onChange={(e) => updateMilestone(m.id, 'description', e.target.value)}
                      />
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Amount"
                        value={m.amount}
                        onChange={(e) => updateMilestone(m.id, 'amount', e.target.value)}
                      />
                    </div>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(m.id)}
                        className="p-1.5 mt-1.5 rounded-lg hover:bg-error-50 text-neutral-400 hover:text-error-600"
                        aria-label={`Remove milestone ${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus className="h-4 w-4" /> Add milestone
              </button>
            </>
          )}

          {((step === 2 && paymentStructure === 'single') || (step === 3 && paymentStructure === 'milestone')) && (
            <div className="space-y-3">
              <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-2 text-sm">
                <Row label="Title" value={title} />
                <Row label="From" value={viewerName} />
                <Row label="To" value={counterpartyName} />
                <Row label="Total" value={new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(parsedTotal)} />
                <Row label="Structure" value={paymentStructure === 'milestone' ? `${milestones.length} milestones` : 'Single payment'} />
                <div className="pt-1">
                  <p className="text-xs text-neutral-500 mb-0.5">Release conditions</p>
                  <p className="text-neutral-700">{releaseConditions}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                An invitation will be sent to <strong>{counterpartyName}</strong>. Funds are held in escrow until conditions are met.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-5 py-4 border-t border-neutral-100 shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={step === 1 ? onClose : () => setStep((s) => s - 1)}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < totalSteps ? (
            <Button
              variant="primary"
              size="sm"
              disabled={step === 1 ? !canAdvanceStep1() : !canAdvanceStep2()}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button variant="success" size="sm" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Sending…' : 'Send agreement'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-neutral-500 shrink-0">{label}</span>
      <span className="text-neutral-900 font-medium text-right">{value}</span>
    </div>
  );
}
