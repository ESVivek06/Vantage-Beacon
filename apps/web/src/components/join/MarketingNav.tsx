'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '/#for-founders', label: 'For Founders' },
  { href: '/#for-freelancers', label: 'For Freelancers' },
  { href: '/#for-investors', label: 'For Investors' },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-neutral-0 shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-8">
        <Link href="/" className="text-display-sm font-bold text-primary-600 min-w-[56px]">
          V.B
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary-600 hover:underline underline-offset-4"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button variant="primary" size="md" asChild>
            <Link href="/join/role">Get early access</Link>
          </Button>
        </div>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 top-16 z-40 bg-neutral-900/50 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-x-0 top-0 rounded-b-2xl border-t border-neutral-200 bg-neutral-0 px-6 pb-8 pt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-5" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-lg font-medium text-neutral-700"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              <Button variant="secondary" size="lg" className="w-full" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button variant="primary" size="lg" className="w-full" asChild>
                <Link href="/join/role">Get early access</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
