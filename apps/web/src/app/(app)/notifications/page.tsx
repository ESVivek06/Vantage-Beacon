'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import { NotificationRow } from '@/components/NotificationRow';
import { MOCK_NOTIFICATIONS, type MockNotification } from '@/lib/messaging-mock-data';

function groupByDate(notifications: MockNotification[]): { label: string; items: MockNotification[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: Record<string, MockNotification[]> = {};

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;
    if (day.getTime() === today.getTime()) {
      label = 'Today';
    } else if (day.getTime() === yesterday.getTime()) {
      label = 'Yesterday';
    } else {
      label = day.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<MockNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groups = groupByDate(notifications);

  function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {});
  }

  function handleAccept(id: string) {
    handleMarkRead(id);
    // Production: POST /api/connections/{id}/respond { action: 'accept' }
  }

  function handleDecline(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Production: POST /api/connections/{id}/respond { action: 'decline' }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-neutral-0 border-b border-neutral-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 flex items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-neutral-900 flex-1 text-center">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-600 text-white">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 ? (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Mark all read
          </button>
        ) : (
          <div className="w-[80px]" />
        )}
      </div>

      {/* Content */}
      {notifications.length === 0 ? (
        <div className="px-4 py-20 flex flex-col items-center text-center">
          <Bell className="h-12 w-12 text-neutral-300 mb-4" aria-hidden="true" />
          <p className="text-sm font-semibold text-neutral-700 mb-1">You&apos;re all caught up</p>
          <p className="text-sm text-neutral-400 max-w-[240px] leading-relaxed">
            We&apos;ll let you know when something needs your attention.
          </p>
        </div>
      ) : (
        <div>
          {groups.map(({ label, items }) => (
            <div key={label}>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-100">
                {label}
              </div>
              {items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
