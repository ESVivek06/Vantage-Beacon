'use client';

import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { Button } from './ui/button';

interface ConnectModalProps {
  name: string;
  onClose: () => void;
  onViewMatches?: () => void;
}

export function ConnectModal({ name, onClose, onViewMatches }: ConnectModalProps) {
  const [step, setStep] = useState<'compose' | 'success'>('compose');
  const [note, setNote] = useState('');
  const MAX = 300;

  function send(withNote: boolean) {
    setStep('success');
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[480px] mx-4 bg-neutral-0 rounded-2xl shadow-2xl animate-modal-mount"
        role="dialog"
        aria-modal="true"
        aria-label={step === 'compose' ? `Connect with ${name}` : 'Request sent'}
      >
        {step === 'compose' ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-display-sm font-bold text-neutral-900">Connect with {name}</h2>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-md text-neutral-500 mb-5">
              Add a personalised note to your connection request (optional).
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX))}
              rows={4}
              placeholder={`Hi ${name}, I came across your profile…`}
              className="w-full rounded-lg border border-neutral-200 text-sm px-3 py-2.5 resize-none focus:outline-none focus:border-primary-500 focus:shadow-focus-ring placeholder:text-neutral-400 mb-1"
              aria-label="Connection note"
            />
            <div className="text-right text-xs text-neutral-400 mb-5">{note.length}/{MAX}</div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => send(false)}>
                Skip note
              </Button>
              <Button variant="primary" size="sm" onClick={() => send(true)}>
                Send Request →
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle2 className="h-16 w-16 text-success-500 mb-4 animate-scale-in" aria-hidden="true" />
            <h2 className="text-display-sm font-bold text-neutral-900 mb-2">Request sent!</h2>
            <p className="text-md text-neutral-500 mb-8">
              We'll let you know when {name} responds.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button variant="primary" size="sm" onClick={() => { onClose(); onViewMatches?.(); }}>
                View more matches →
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Back to matches
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
