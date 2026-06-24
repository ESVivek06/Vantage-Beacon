'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/feed', label: 'Matches', icon: Users },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200 flex sm:hidden"
    >
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2 gap-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
            pathname === href ? 'text-primary-600' : 'text-neutral-500',
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className="text-2xs font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
