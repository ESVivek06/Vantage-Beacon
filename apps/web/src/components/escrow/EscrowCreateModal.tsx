'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;
type PaymentStructure = 'single' | 'milestone';

interface Milestone {
  id: string;
  description: string;
  amount: string;
}

interface EscrowCreateModalProps {
  counterpartyId: string;
  counterpartyName: string;
  counterpartyRole: string;
  counterpartyAvatarUrl?: string;
  onClose: () => void;
  onCreated: (escrowId: string) => void;
}

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-0">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-[250ms]',
              i + 1 === current ? 'h-2 w-6 bg-primary-600' : 'h-2 w-2 bg-neutral-200',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-400 font-medium">Step {current} of {total}</span>
    </div>
  );
}

export function EscrowCreateModal({
  counterpartyId,
  counterpartyName,
  counterpartyRole,
  onClose,
  onCreated,
}: EscrowCreateModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentStructure, setPaymentStructure] = useState<PaymentStructure>('single');
  const [releaseConditions, setReleaseConditions] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', description: '', amount: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [conditionsError, setConditionsError] = useState('');

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    }
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    el.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', onEsc);
    return () => { el.removeEventListener('keydown', trapFocus); document.removeEventListener('keydown', onEsc); };
  }, [onClose]);

  const parsedTotal = parseFloat(totalAmount.replace(/[^0-9.]/g, '')) || 0;
  const milestonesTotal = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const milestoneMismatch =
    paymentStructure === 'milestone' && parsedTotal > 0 && Math.abs(milestonesTotal - parsedTotal) > 0.01;

  function validateStep1(): boolean {
    let ok = true;
    if (!title.trim()) { setTitleError('Please enter a project description.'); ok = false; }
    else setTitleError('');
    if (!parsedTotal || parsedTotal <= 0) { setAmountError('Please enter a valid amount.'); ok = false; }
    else setAmountError('');
    if (!releaseConditions.trim()) { setConditionsError('Please describe the release conditions.'); ok = false; }
    else setConditionsError('');
    return ok;
  }

  function addMilestone() {
    setMilestones((prev) => [...prev, { id: String(Date.now()), description: '', amount: '' }]);
  }

  function removeMilestone(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMilestone(id: string, field: 'description' | 'amount', value: string) {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  async function handleCreate() {
    setSubmitting(true);
    try {
      const body = {
        counterpartyId,
        title: title.trim(),
        currency,
        totalAmount: parsedTotal,
        paymentStructure,
        releaseConditions: releaseConditions.trim(),
        milestones:
          paymentStructure === 'milestone'
            ? milestones.map((m) => ({ description: m.description, amount: parseFloat(m.amount) || 0 }))
            : [],
      };
      const res = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      onCreated(data.id ?? 'new');
    } catch {
      setSubmitting(false);
    }
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);

  return (
    <>
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl mx-4 bg-neutral-0 rounded-2xl shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Create Escrow"
      >
        <StepIndicator current={step} total={3} />

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <div className="p-6 pt-4 space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Create Escrow</h2>
              <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Counterparty card */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex gap-3 items-center">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold shrink-0">
                {counterpartyName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{counterpartyName}</p>
                <p className="text-xs text-neutral-500">{counterpartyRole}</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="esc-title">Project / Engagement description *</Label>
              <Input
                id="esc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => { if (!title.trim()) setTitleError('Please enter a project description.'); else setTitleError(''); }}
                placeholder="e.g. Brand identity rebrand"
                error={!!titleError}
                className="mt-1"
              />
              {titleError && <p className="text-xs text-error-600 mt-1">{titleError}</p>}
            </div>

            {/* Currency + Amount */}
            <div className="flex gap-3">
              <div className="w-28">
                <Label htmlFor="esc-currency">Currency *</Label>
                <select
                  id="esc-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-sm border border-neutral-300 bg-neutral-0 px-3 text-sm text-neutral-900 focus-visible:outline-none focus-visible:border-primary-500"
                >
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div className="flex-1">
                <Label htmlFor="esc-amount">Total amount *</Label>
                <Input
                  id="esc-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  onBlur={() => { if (!parsedTotal || parsedTotal <= 0) setAmountError('Please enter a valid amount.'); else setAmountError(''); }}
                  placeholder="0.00"
                  error={!!amountError}
                  className="mt-1"
                  aria-describedby="esc-currency"
                />
                {amountError && <p className="text-xs text-error-600 mt-1">{amountError}</p>}
              </div>
            </div>

            {/* Payment structure */}
            <div>
              <Label>Payment structure</Label>
              <div className="flex gap-4 mt-2">
                {(['single', 'milestone'] as PaymentStructure[]).map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment-structure"
                      value={s}
                      checked={paymentStructure === s}
                      onChange={() => setPaymentStructure(s)}
                      className="accent-primary-600"
                    />
                    <span className="text-sm text-neutral-800 capitalize">{s === 'single' ? 'Single payment' : 'Milestone-based'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Release conditions */}
            <div>
              <Label htmlFor="esc-conditions">Release conditions *</Label>
              <textarea
                id="esc-conditions"
                value={releaseConditions}
                onChange={(e) => setReleaseConditions(e.target.value)}
                onBlur={() => { if (!releaseConditions.trim()) setConditionsError('Please describe the release conditions.'); else setConditionsError(''); }}
                rows={3}
                placeholder='e.g. "Delivery of final designs in Figma + client approval"'
                className={cn(
                  'mt-1 w-full rounded-sm border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none focus:border-primary-500 min-h-[96px]',
                  conditionsError ? 'border-error-500' : 'border-neutral-300',
                )}
              />
              {conditionsError && <p className="text-xs text-error-600 mt-1">{conditionsError}</p>}
            </div>

            {/* Warning notice */}
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-warning-700">
                Escrow cannot be released until conditions are met. Both parties will receive an email confirmation.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (validateStep1()) {
                    setStep(paymentStructure === 'milestone' ? 2 : 3);
                  }
                }}
              >
                {paymentStructure === 'milestone' ? 'Next: Milestones →' : 'Review & create →'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Milestones */}
        {step === 2 && (
          <div className="p-6 pt-4 space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Milestones</h2>
              <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {milestones.map((m, idx) => (
                <div key={m.id} className="flex gap-2 items-center">
                  <span className="text-xs text-neutral-400 w-4 shrink-0">{idx + 1}</span>
                  <Input
                    value={m.description}
                    onChange={(e) => updateMilestone(m.id, 'description', e.target.value)}
                    placeholder="Milestone description"
                    className="flex-1"
                    aria-label={`Milestone ${idx + 1} description`}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={m.amount}
                    onChange={(e) => updateMilestone(m.id, 'amount', e.target.value)}
                    placeholder="0.00"
                    className="w-28"
                    aria-label={`Milestone ${idx + 1} amount`}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeMilestone(m.id)}
                    disabled={milestones.length === 1}
                    aria-label={`Remove milestone ${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="ghost" size="sm" onClick={addMilestone} className="flex items-center gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add milestone
            </Button>

            <div className="flex items-center justify-between pt-1">
              <p className={cn('text-sm font-semibold', milestoneMismatch ? 'text-error-600' : 'text-neutral-900')}>
                Total: {fmt(milestonesTotal)} / {fmt(parsedTotal)}
                {milestoneMismatch && (
                  <span className="block text-xs font-normal text-error-600">
                    Total must equal {fmt(parsedTotal)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← Back</Button>
              <Button
                variant="primary"
                size="sm"
                disabled={milestoneMismatch || milestones.some((m) => !m.description || !m.amount)}
                onClick={() => setStep(3)}
              >
                Review & create →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <div className="p-6 pt-4 space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Confirm escrow</h2>
              <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Counterparty</span>
                <span className="text-neutral-900 font-medium">{counterpartyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Project</span>
                <span className="text-neutral-900 font-medium truncate max-w-[220px]">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount</span>
                <span className="text-neutral-900 font-medium">{fmt(parsedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Structure</span>
                <span className="text-neutral-900 font-medium capitalize">
                  {paymentStructure === 'single' ? 'Single payment' : `${milestones.length} milestones`}
                </span>
              </div>
              <div className="pt-1 border-t border-neutral-200">
                <span className="text-neutral-500">Release conditions:</span>
                <p className="text-neutral-700 mt-1 italic text-xs">&ldquo;{releaseConditions}&rdquo;</p>
              </div>
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-warning-700">
                Both parties will receive an email confirmation once the escrow is created.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(paymentStructure === 'milestone' ? 2 : 1)}>← Back</Button>
              <Button variant="primary" size="sm" disabled={submitting} onClick={handleCreate}>
                {submitting ? 'Creating…' : 'Create & notify →'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
