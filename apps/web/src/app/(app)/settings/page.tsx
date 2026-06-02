'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, Mail, Lock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const user = session?.user as { email?: string; name?: string } | undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-display-sm font-bold text-neutral-900 mb-8">Settings</h1>

      {/* Account section */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Account</h2>
        <div className="bg-neutral-0 rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {/* Email */}
          <div className="flex items-center gap-3 px-5 py-4">
            <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-500 mb-0.5">Email address</p>
              <p className="text-sm text-neutral-900 truncate">{user?.email ?? '—'}</p>
            </div>
            <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">Read-only</span>
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 px-5 py-4">
            <Lock className="h-4 w-4 text-neutral-400 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-500 mb-0.5">Password</p>
              <p className="text-sm text-neutral-900">••••••••</p>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Change
            </Link>
          </div>
        </div>
      </section>

      {/* Notifications section */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Notifications</h2>
        <div className="bg-neutral-0 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-3 px-5 py-4">
            <Bell className="h-4 w-4 text-neutral-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">Email notifications</p>
              <p className="text-xs text-neutral-500 mt-0.5">Receive updates about matches and messages</p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setNotificationsEnabled((v) => !v)}
              className={[
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-fast focus:outline-none',
                notificationsEnabled ? 'bg-primary-600' : 'bg-neutral-300',
              ].join(' ')}
              role="switch"
              aria-checked={notificationsEnabled}
            >
              <span
                className={[
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-fast',
                  notificationsEnabled ? 'translate-x-4' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Session</h2>
        <div className="bg-neutral-0 rounded-xl border border-neutral-200">
          <div className="px-5 py-4">
            <Button
              variant="ghost"
              size="md"
              className="text-error-600 hover:bg-error-50 hover:text-error-700 gap-2 -ml-2"
              onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
