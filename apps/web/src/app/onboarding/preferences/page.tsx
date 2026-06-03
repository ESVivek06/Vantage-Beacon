'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StepProgress } from '@/components/onboarding/StepProgress';

const STEPS = ['You', 'Profile', 'Preferences', 'Matching'];

const CONNECT_ROLES = [
  { id: 'freelancers', label: 'Freelancers' },
  { id: 'founders', label: 'Founders' },
  { id: 'investors', label: 'Investors' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'stakeholders', label: 'Stakeholders' },
];

const REGIONS = [
  { id: 'uk', label: 'UK' },
  { id: 'india', label: 'India' },
  { id: 'north-america', label: 'North America' },
  { id: 'global', label: 'Global / Remote' },
];

const GOALS = [
  { id: 'find-talent', label: 'Find talent / co-founder' },
  { id: 'investment', label: 'Get investment / partnerships' },
  { id: 'services', label: 'Offer services / find work' },
];

function Chip({
  label, selected, onClick, multi = false,
}: {
  label: string; selected: boolean; onClick: () => void; multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 h-9 px-4 rounded-full border text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:shadow-focus-ring',
        selected
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-neutral-0 text-neutral-700 border-neutral-200 hover:border-neutral-300',
      ].join(' ')}
    >
      {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  );
}

function GoalCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={[
        'w-full h-16 text-sm font-semibold text-left px-4 rounded-lg border-[1.5px] transition-colors',
        'focus-visible:outline-none focus-visible:shadow-focus-ring',
        selected
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-neutral-200 bg-neutral-0 text-neutral-700 hover:border-neutral-300',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function OnboardingPreferencesPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [connectRoles, setConnectRoles] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [goal, setGoal] = useState('');

  function toggleMulti(id: string, arr: string[], setter: (v: string[]) => void) {
    setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  async function handleContinue() {
    setSubmitted(true);
    if (connectRoles.length === 0) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    router.push('/onboarding/matching');
  }

  const rolesError = submitted && connectRoles.length === 0;

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/onboarding/profile" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-8">
          <StepProgress steps={STEPS} current={2} />
        </div>

        <h1 className="text-display-sm font-bold text-neutral-900 mb-1">Set your matching preferences</h1>
        <p className="text-md text-neutral-500 mb-8">These guide your AI-powered match results.</p>

        <div className="space-y-8 bg-neutral-0 rounded-xl shadow-xs p-6 border border-neutral-100">
          {/* Q1: Who to connect with */}
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-900 mb-3 block">
              Who are you looking to connect with?
              {rolesError && <span className="text-xs font-normal text-error-600 ml-2" role="alert">Select at least one</span>}
            </legend>
            <div
              role="group"
              aria-label="Roles to connect with"
              className="flex flex-wrap gap-2"
            >
              {CONNECT_ROLES.map((r) => (
                <Chip
                  key={r.id}
                  label={r.label}
                  selected={connectRoles.includes(r.id)}
                  onClick={() => toggleMulti(r.id, connectRoles, setConnectRoles)}
                  multi
                />
              ))}
            </div>
          </fieldset>

          {/* Q2: Regions */}
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-900 mb-3 block">
              Where are you open to working / connecting?
            </legend>
            <div role="group" aria-label="Regions" className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <Chip
                  key={r.id}
                  label={r.label}
                  selected={regions.includes(r.id)}
                  onClick={() => toggleMulti(r.id, regions, setRegions)}
                  multi
                />
              ))}
            </div>
          </fieldset>

          {/* Q3: Goal */}
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-900 mb-3 block">
              What's your main goal right now?
            </legend>
            <div role="radiogroup" aria-label="Main goal" className="space-y-3">
              {GOALS.map((g) => (
                <GoalCard
                  key={g.id}
                  label={g.label}
                  selected={goal === g.id}
                  onClick={() => setGoal(g.id)}
                />
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex justify-between items-center gap-3 mt-6">
          <Button variant="ghost" size="md" asChild>
            <Link href="/onboarding/profile"><ChevronLeft className="h-4 w-4" />Back</Link>
          </Button>
          <Button variant="primary" size="md" disabled={saving} onClick={handleContinue}>
            {saving ? 'Saving…' : 'Continue to Matching →'}
          </Button>
        </div>
      </div>
    </main>
  );
}
