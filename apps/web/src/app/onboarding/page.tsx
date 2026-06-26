'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Rocket, TrendingUp, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { RoleCard } from '@/components/onboarding/RoleCard';
import type { RoleOption } from '@/components/onboarding/RoleCard';

const STEPS = ['You', 'Profile', 'Preferences', 'Matching'];

const ROLES: RoleOption[] = [
  { id: 'freelancer', icon: Briefcase, label: 'Freelancer', description: 'Offer skills & services' },
  { id: 'founder', icon: Rocket, label: 'Founder', description: 'Build your company' },
  { id: 'investor', icon: TrendingUp, label: 'Investor', description: 'Discover opportunities' },
  { id: 'supplier', icon: Package, label: 'Supplier', description: 'Provide resources' },
  { id: 'stakeholder', icon: Users, label: 'Stakeholder', description: 'Stay connected' },
];

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('freelancer');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selected || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selected }),
      });
      if (!res.ok) throw new Error('Failed to save role');
      router.push('/onboarding/profile');
    } catch {
      setError('Could not save your role. Please try again.');
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop (desktop modal style) */}
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm md:flex md:items-center md:justify-center min-h-dvh" aria-hidden="true" />

      {/* Modal shell — desktop */}
      <main
        className={[
          'relative z-10',
          // Desktop: centered modal
          'md:fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
          'md:w-full md:max-w-[600px] md:bg-neutral-0 md:rounded-2xl md:shadow-2xl md:p-10 md:animate-modal-mount',
          // Mobile: full-screen
          'max-md:min-h-dvh max-md:bg-neutral-0 max-md:px-5 max-md:pt-6 max-md:pb-24 max-md:overflow-y-auto',
        ].join(' ')}
        aria-label="Onboarding — Step 1: Role confirmation"
      >
        {/* Brand */}
        <div className="text-center mb-6">
          <Link href="/" className="text-display-sm font-bold text-primary-600">V.B</Link>
        </div>

        {/* Step progress */}
        <div className="mb-8">
          <StepProgress steps={STEPS} current={0} />
        </div>

        {/* Heading */}
        <h1 className="text-display-sm font-bold text-neutral-900 text-center mb-2 md:text-left">
          Welcome to V.B — let's confirm who you are
        </h1>
        <p className="text-lg text-neutral-500 text-center mb-8 md:text-left">
          Choose your primary role — you can always change it later.
        </p>

        {/* Role selector */}
        <div
          role="radiogroup"
          aria-label="Select your role"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2"
        >
          {ROLES.slice(0, 3).map((r) => (
            <RoleCard key={r.id} role={r} selected={selected === r.id} onSelect={setSelected} />
          ))}
          <div className="col-span-2 sm:col-span-3 grid grid-cols-2 sm:grid-cols-2 gap-3 sm:flex sm:justify-center sm:gap-3">
            {ROLES.slice(3).map((r) => (
              <RoleCard key={r.id} role={r} selected={selected === r.id} onSelect={setSelected} />
            ))}
          </div>
        </div>

        <p className="text-xs text-neutral-500 text-center mb-8">
          You can always change your role later in Settings.
        </p>

        {/* Footer CTA */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selected || saving}
            onClick={handleContinue}
          >
            {saving ? 'Saving…' : 'Confirm & Continue →'}
          </Button>
          {error && (
            <p className="text-sm text-error-600 text-center" role="alert">{error}</p>
          )}
          <p className="text-sm text-neutral-500 text-center">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
