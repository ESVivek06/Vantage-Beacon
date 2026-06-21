'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Rocket, TrendingUp, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Role {
  id: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  description: string;
  color: string;
}

const roles: Role[] = [
  {
    id: 'freelancer',
    icon: Briefcase,
    label: 'Freelancer',
    description: 'Offer your skills to startups and businesses',
    color: '#7C3AED',
  },
  {
    id: 'founder',
    icon: Rocket,
    label: 'Founder',
    description: 'Find talent, advisors, and investors for your startup',
    color: '#0D9488',
  },
  {
    id: 'investor',
    icon: TrendingUp,
    label: 'Investor',
    description: 'Discover and support promising founders and startups',
    color: '#D97706',
  },
  {
    id: 'supplier',
    icon: Package,
    label: 'Supplier',
    description: 'Offer services and products to the V.B community',
    color: '#DB2777',
  },
];

export default function OnboardingRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-neutral-50">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="text-3xl font-bold text-primary-600">
            V.B
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-display-lg font-bold text-neutral-900 mb-3">
            How will you use V.B?
          </h1>
          <p className="text-lg text-neutral-500">
            Choose your primary role — you can add more later.
          </p>
        </div>

        {/* Role grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {roles.map(({ id, icon: Icon, label, description, color }) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={[
                  'relative text-left p-6 rounded-xl border-2 transition-all duration-normal group',
                  'hover:-translate-y-0.5',
                  isSelected
                    ? 'border-primary-600 bg-primary-50 shadow-md scale-[1.01]'
                    : 'border-neutral-200 bg-neutral-0 hover:border-neutral-300 hover:shadow-sm',
                ].join(' ')}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-full bg-primary-600 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <Icon
                  className="h-10 w-10 mb-3 transition-transform group-hover:scale-105"
                  style={{ color }}
                />
                <h3 className="text-xl font-semibold text-neutral-900 mb-1">{label}</h3>
                <p className="text-sm text-neutral-600">{description}</p>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Button
            variant="primary"
            size="xl"
            className="w-full max-w-xs"
            disabled={!selected || saving}
            onClick={handleContinue}
          >
            {saving ? 'Saving…' : 'Continue'}
          </Button>
          {error && (
            <p className="text-sm text-error-600 text-center" role="alert">{error}</p>
          )}
          <p className="text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
