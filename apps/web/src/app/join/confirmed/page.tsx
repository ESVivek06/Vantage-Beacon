'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/TrustBadge';
import { ReferralNudgeCard } from '@/components/join/ReferralNudgeCard';

const NEXT_STEPS = [
  {
    title: 'Your profile is reviewed',
    sub: 'We check your details to keep the platform high quality.',
    badge: 'Within 24 hours',
  },
  {
    title: 'You get your first matches',
    sub: 'Our AI surfaces the most relevant connections for your role.',
    badge: 'Within 48 hours',
  },
  {
    title: 'You go live on V.B',
    sub: 'Start connecting, messaging, and exploring opportunities.',
    badge: 'After verification',
  },
];

export default function ConfirmedPage() {
  const [role, setRole] = useState<string>('stakeholder');
  const [userCode, setUserCode] = useState<string>('VB-X4K9P');

  useEffect(() => {
    const r = sessionStorage.getItem('vb_join_role_label') ?? sessionStorage.getItem('vb_join_role');
    if (r) setRole(r);
    const code = sessionStorage.getItem('vb_user_code');
    if (code) setUserCode(code);
  }, []);

  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-neutral-200 bg-neutral-0 p-8 shadow-xl">
      {/* Success icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-100">
        <CheckCircle className="h-10 w-10 text-success-600" aria-hidden="true" />
      </div>

      <h1 className="text-center text-display-sm font-bold text-neutral-900">You&apos;re on the list!</h1>

      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="text-md text-neutral-600">Joining as:</span>
        <RoleBadge role={role} />
      </div>

      <p className="mt-3 text-center text-md text-neutral-500">
        We&apos;ll review your registration and reach out within 48 hours to confirm your access.
      </p>

      <hr className="my-6 border-neutral-200" />

      <h2 className="mb-4 text-xl font-semibold text-neutral-900">What happens next</h2>

      <ol className="flex flex-col gap-5" aria-label="Next steps timeline">
        {NEXT_STEPS.map((step, i) => (
          <li key={i} className="relative flex gap-4">
            {/* Timeline track */}
            <div className="relative flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary-200 bg-neutral-0">
                <span className="text-sm font-semibold text-neutral-600">{i + 1}</span>
              </div>
              {i < NEXT_STEPS.length - 1 && (
                <div className="absolute top-8 left-[15px] h-full w-0.5 border-l-2 border-dashed border-neutral-200" aria-hidden="true" />
              )}
            </div>
            <div className="pb-5">
              <p className="text-md font-semibold text-neutral-800">{step.title}</p>
              <p className="mt-0.5 text-sm text-neutral-500">{step.sub}</p>
              <span className="mt-1 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {step.badge}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <ReferralNudgeCard userCode={userCode} />
      </div>

      <Button size="lg" className="mt-6 w-full" asChild>
        <Link href="/onboarding/role">Explore V.B →</Link>
      </Button>
    </div>
  );
}
