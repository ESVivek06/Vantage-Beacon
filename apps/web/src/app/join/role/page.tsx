'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Rocket, TrendingUp, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressStepBar } from '@/components/join/ProgressStepBar';

const ROLES = [
  {
    id: 'freelancer',
    label: 'Freelancer',
    sub: 'Skills & services for hire',
    icon: Briefcase,
    iconBg: '#E0E7FF',
    iconColor: '#4F46E5',
  },
  {
    id: 'founder',
    label: 'Founder / Startup',
    sub: 'Building a startup or company',
    icon: Rocket,
    iconBg: '#CCFBF1',
    iconColor: '#0D9488',
  },
  {
    id: 'investor',
    label: 'Investor',
    sub: 'Investing in startups & founders',
    icon: TrendingUp,
    iconBg: '#FEF3C7',
    iconColor: '#B45309',
  },
  {
    id: 'supplier',
    label: 'Supplier / Service',
    sub: 'Products & services supplier',
    icon: Package,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
  },
  {
    id: 'stakeholder',
    label: 'Stakeholder',
    sub: 'Advisor, partner, or ecosystem supporter',
    icon: Users,
    iconBg: '#F1F5F9',
    iconColor: '#64748B',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselect = searchParams.get('preselect');

  const [selected, setSelected] = useState<string | null>(preselect ?? null);

  useEffect(() => {
    const stored = sessionStorage.getItem('vb_join_role');
    if (stored && !preselect) setSelected(stored);
  }, [preselect]);

  function handleContinue() {
    if (!selected) return;
    sessionStorage.setItem('vb_join_role', selected);
    router.push('/join/details');
  }

  function handleKeyDown(e: React.KeyboardEvent, roleId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected(roleId);
    }
  }

  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-neutral-200 bg-neutral-0 p-8 shadow-xl">
      <ProgressStepBar currentStep={1} totalSteps={3} />

      <Link
        href="/"
        className="mb-6 mt-4 inline-block text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
      >
        ← Back to V.B
      </Link>

      <h1 className="text-display-sm font-bold text-neutral-900">What best describes you?</h1>
      <p className="mt-2 mb-6 text-md text-neutral-500">
        We&apos;ll personalise your V.B experience based on your role.
      </p>

      <fieldset>
        <legend className="sr-only">Select your role</legend>
        <div className="flex flex-col gap-3">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            return (
              <label
                key={role.id}
                className="flex h-[72px] cursor-pointer items-center gap-4 rounded-xl border px-5 transition-all duration-fast"
                style={{
                  borderColor: isSelected ? '#4F46E5' : '#E2E8F0',
                  borderWidth: isSelected ? '2px' : '1.5px',
                  backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                  boxShadow: isSelected ? '0 1px 3px rgba(15,23,42,0.1)' : undefined,
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.id}
                  checked={isSelected}
                  onChange={() => setSelected(role.id)}
                  onKeyDown={(e) => handleKeyDown(e, role.id)}
                  className="sr-only"
                  aria-checked={isSelected}
                />
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: role.iconBg }}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" style={{ color: role.iconColor }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-md font-semibold text-neutral-900">{role.label}</span>
                  <span className="text-sm text-neutral-500">{role.sub}</span>
                </div>
                <div className="ml-auto" aria-hidden="true">
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full border"
                    style={{
                      borderColor: isSelected ? '#4F46E5' : '#CBD5E1',
                      backgroundColor: isSelected ? '#4F46E5' : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-0" />
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Button
        size="xl"
        className="mt-6 w-full"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue →
      </Button>
    </div>
  );
}
