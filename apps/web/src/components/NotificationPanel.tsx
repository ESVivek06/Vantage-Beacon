'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { NotificationRow } from './NotificationRow';
import type { MockNotification } from '@/lib/messaging-mock-data';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
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
    // In production: POST /api/connections/{id}/respond { action: 'accept' }
  }

  function handleDecline(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // In production: POST /api/connections/{id}/respond { action: 'decline' }
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay to close on outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        className="absolute right-0 top-full mt-2 z-50 w-[380px] bg-neutral-0 border border-neutral-200 rounded-xl shadow-lg max-h-[520px] overflow-y-auto animate-card-reveal"
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 sticky top-0 bg-neutral-0">
          <span className="text-sm font-semibold text-neutral-900">Notifications</span>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="px-4 py-8 flex justify-center">
            <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-12 flex flex-col items-center text-center">
            <Bell className="h-12 w-12 text-neutral-300 mb-4" aria-hidden="true" />
            <p className="text-sm font-semibold text-neutral-700 mb-1">You&apos;re all caught up</p>
            <p className="text-sm text-neutral-400 max-w-[240px] leading-relaxed">
              We&apos;ll let you know when something needs your attention.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}

            <div className="px-4 py-3 text-center border-t border-neutral-100">
              <Link
                href="/notifications"
                onClick={onClose}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                View all notifications →
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
