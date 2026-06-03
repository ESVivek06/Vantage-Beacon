import Link from 'next/link';
import { Button } from './ui/button';
import { ProfileCompletionRing } from './ProfileCompletionRing';

interface EmptyStateDashboardProps {
  percent?: number;
  stepsLeft?: number;
  incompleteSteps?: Array<{ label: string; href: string }>;
}

export function EmptyStateDashboard({ percent = 40, stepsLeft = 4 }: EmptyStateDashboardProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-[480px] mx-auto py-16 px-8">
      {/* Illustration */}
      <svg
        width="160"
        height="120"
        viewBox="0 0 160 120"
        className="mb-8"
        aria-hidden="true"
      >
        <circle cx="80" cy="60" r="40" fill="#E0E7FF" />
        <circle cx="40" cy="40" r="14" fill="#C7D2FE" />
        <circle cx="120" cy="35" r="10" fill="#C7D2FE" />
        <circle cx="130" cy="85" r="12" fill="#C7D2FE" />
        <line x1="80" y1="60" x2="40" y2="40" stroke="#A5B4FC" strokeWidth="2" />
        <line x1="80" y1="60" x2="120" y2="35" stroke="#A5B4FC" strokeWidth="2" />
        <line x1="80" y1="60" x2="130" y2="85" stroke="#A5B4FC" strokeWidth="2" />
      </svg>

      <h2 className="text-display-sm font-bold text-neutral-900 mb-3">
        Your matches are being prepared
      </h2>
      <p className="text-md text-neutral-500 mb-8">
        Complete your profile to help our AI find the best matches for you.
      </p>

      <div className="mb-8">
        <ProfileCompletionRing percent={percent} stepsLeft={stepsLeft} size="lg" />
      </div>

      <Button variant="primary" size="lg" className="w-full max-w-60" asChild>
        <Link href="/profile/edit">Complete Profile</Link>
      </Button>
      <Link href="/dashboard" className="text-sm text-neutral-400 hover:underline mt-3 block">
        I'll do this later
      </Link>
    </div>
  );
}
