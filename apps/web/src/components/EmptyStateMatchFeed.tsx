import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Suggestion {
  text: string;
  href: string;
}

interface EmptyStateMatchFeedProps {
  suggestions?: Suggestion[];
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { text: 'Add at least 3 skills to your profile', href: '/profile/edit#skills' },
  { text: 'Select your availability', href: '/profile/edit#availability' },
  { text: 'Add your location', href: '/profile/edit#location' },
];

export function EmptyStateMatchFeed({ suggestions = DEFAULT_SUGGESTIONS }: EmptyStateMatchFeedProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-[520px] mx-auto py-16 px-8">
      {/* Illustration */}
      <svg
        width="160"
        height="140"
        viewBox="0 0 160 140"
        className="mb-8"
        aria-hidden="true"
      >
        <circle cx="60" cy="75" r="40" fill="#E2E8F0" />
        <circle cx="60" cy="55" r="18" fill="#CBD5E1" />
        <rect x="30" y="75" width="60" height="40" rx="8" fill="#CBD5E1" />
        <circle cx="110" cy="65" r="28" fill="none" stroke="#BFDBFE" strokeWidth="4" />
        <line x1="130" y1="85" x2="145" y2="100" stroke="#BFDBFE" strokeWidth="5" strokeLinecap="round" />
        <circle cx="110" cy="62" r="12" fill="#BFDBFE" />
      </svg>

      <h2 className="text-display-sm font-bold text-neutral-900 mb-3">No matches yet</h2>
      <p className="text-md text-neutral-500 mb-6">
        Our AI needs a bit more from your profile to find the right connections.
      </p>

      {/* Improvement suggestions */}
      {suggestions.length > 0 && (
        <ul className="w-full space-y-3 mb-8 text-left" aria-label="Profile improvement suggestions">
          {suggestions.map((s) => (
            <li
              key={s.text}
              className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-lg p-4"
            >
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" aria-hidden="true" />
              <span className="text-sm text-neutral-700 flex-1">{s.text}</span>
              <Link href={s.href} className="text-sm text-primary-600 hover:underline shrink-0">
                Fix now →
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3 flex-wrap justify-center">
        <Button variant="primary" size="lg" asChild>
          <Link href="/profile/edit">Update Profile</Link>
        </Button>
        <Button variant="ghost" size="md" asChild>
          <Link href="/discover">Search manually →</Link>
        </Button>
      </div>
    </div>
  );
}
