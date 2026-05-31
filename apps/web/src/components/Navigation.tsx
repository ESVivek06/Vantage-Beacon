'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Home as House,
  Compass,
  Sparkles,
  MessageSquare,
  User,
  Bell,
  Plus,
  LogOut,
  Settings,
  ChevronDown,
  Briefcase,
  Rocket,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { initials } from '@/lib/utils';

interface NavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    region?: string;
  };
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  freelancer: Briefcase,
  founder: Rocket,
  investor: TrendingUp,
  supplier: Package,
};

const roleLabels: Record<string, string> = {
  freelancer: 'Freelancer',
  founder: 'Founder',
  investor: 'Investor',
  supplier: 'Supplier',
};

const roleColors: Record<string, string> = {
  freelancer: 'text-[#7C3AED] bg-[#7C3AED]/10',
  founder: 'text-[#0D9488] bg-[#0D9488]/10',
  investor: 'text-[#D97706] bg-[#D97706]/10',
  supplier: 'text-[#DB2777] bg-[#DB2777]/10',
};

const bottomNavItems = [
  { href: '/feed', label: 'Home', icon: House },
  { href: '/discover/talent', label: 'Discover', icon: Compass },
  { href: '/feed', label: 'Feed', icon: Sparkles },
  { href: '/inbox', label: 'Inbox', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

const desktopNavLinks = [
  { href: '/discover/talent', label: 'Discover' },
  { href: '/feed', label: 'My Feed' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/inbox', label: 'Inbox' },
];

export function Navigation({ user }: NavProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = user.name ?? user.email ?? 'User';
  const role = user.role ?? 'freelancer';
  const RoleIcon = roleIcons[role] ?? Briefcase;
  const roleLabel = roleLabels[role] ?? role;
  const roleColorClass = roleColors[role] ?? 'text-primary-600 bg-primary-50';

  const isFounderOrInvestor = role === 'founder' || role === 'investor';

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex fixed top-0 inset-x-0 z-50 h-16 items-center border-b border-neutral-200 bg-neutral-0 shadow-xs px-8">
        {/* Logo */}
        <Link href="/feed" className="text-xl font-bold text-primary-600 mr-10 shrink-0">
          V.B
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {desktopNavLinks.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/feed' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-fast',
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {isFounderOrInvestor && (
            <Button variant="primary" size="sm" asChild>
              <Link href="/opportunities/new">
                <Plus className="h-4 w-4" />
                Post Opportunity
              </Link>
            </Button>
          )}

          {/* Notification bell */}
          <button
            className="relative h-9 w-9 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-fast"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* Role chip + Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors duration-fast"
              aria-label="Profile menu"
            >
              <Avatar className="h-9 w-9">
                {user.image && <AvatarImage src={user.image} alt={displayName} />}
                <AvatarFallback className="text-xs bg-primary-100 text-primary-700 font-medium">
                  {initials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'hidden lg:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                  roleColorClass,
                )}
              >
                <RoleIcon className="h-3 w-3" />
                {roleLabel} mode
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-0 border border-neutral-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {user.image && <AvatarImage src={user.image} alt={displayName} />}
                        <AvatarFallback className="text-sm bg-primary-100 text-primary-700 font-medium">
                          {initials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">{displayName}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <p className="text-2xs font-semibold uppercase tracking-widest text-neutral-400 px-2 py-1.5">
                      Active Role
                    </p>
                    <div
                      className={cn(
                        'flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium',
                        roleColorClass,
                      )}
                    >
                      <RoleIcon className="h-4 w-4" />
                      {roleLabel}
                      <span className="ml-auto text-xs">✓</span>
                    </div>
                  </div>

                  <div className="p-2 border-t border-neutral-100">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-neutral-400" />
                      Profile settings
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-error-600 hover:bg-neutral-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 flex h-14 items-center justify-between border-b border-neutral-200 bg-neutral-0 px-4 shadow-xs">
        <Link href="/feed" className="text-xl font-bold text-primary-600">
          V.B
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="h-9 w-9 flex items-center justify-center rounded-md text-neutral-500"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <Avatar className="h-8 w-8">
            {user.image && <AvatarImage src={user.image} alt={displayName} />}
            <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex h-14 items-stretch border-t border-neutral-200 bg-neutral-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/feed' && pathname.startsWith(href));
          return (
            <Link
              key={`${href}-${label}`}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-2xs font-medium transition-colors duration-fast',
                isActive ? 'text-primary-600' : 'text-neutral-400',
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full" />
              )}
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
