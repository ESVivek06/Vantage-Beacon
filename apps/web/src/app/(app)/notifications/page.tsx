'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Sparkles,
  MessageSquare,
  UserPlus,
  Briefcase,
  Settings,
  CheckCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, formatRelative, initials } from '@/lib/utils';
import { MOCK_NOTIFICATIONS, type MockNotification } from '@/lib/messaging-mock-data';

const notifTypeConfig: Record<
  MockNotification['type'],
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  match: { icon: Sparkles, color: 'text-primary-600', bg: 'bg-primary-50' },
  message: { icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-50' },
  connection: { icon: UserPlus, color: 'text-success-600', bg: 'bg-success-50' },
  opportunity: { icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
  system: { icon: Settings, color: 'text-neutral-500', bg: 'bg-neutral-100' },
};

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'match', label: 'Matches' },
  { key: 'message', label: 'Messages' },
  { key: 'connection', label: 'Connections' },
] as const;

type FilterKey = (typeof filterTabs)[number]['key'];

function NotificationItem({
  notif,
  onMarkRead,
}: {
  notif: MockNotification;
  onMarkRead: (id: string) => void;
}) {
  const config = notifTypeConfig[notif.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 border-b border-neutral-100 hover:bg-neutral-50 transition-colors group',
        !notif.read && 'bg-primary-50/40 border-l-2 border-l-primary-500',
      )}
    >
      {/* Icon or avatar */}
      <div className="shrink-0 mt-0.5">
        {notif.actorName ? (
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={cn('text-xs font-medium', config.bg, config.color)}>
                {initials(notif.actorName)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center',
                config.bg,
              )}
            >
              <Icon className={cn('h-2.5 w-2.5', config.color)} />
            </span>
          </div>
        ) : (
          <div className={cn('h-9 w-9 rounded-full flex items-center justify-center', config.bg)}>
            <Icon className={cn('h-4 w-4', config.color)} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', !notif.read ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700')}>
          {notif.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-2xs text-neutral-400">{formatRelative(notif.createdAt)}</span>
          {notif.actorRole && (
            <>
              <span className="text-neutral-300">·</span>
              <span className="text-2xs text-neutral-400 capitalize">{notif.actorRole}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.read && (
          <button
            onClick={() => onMarkRead(notif.id)}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
            title="Mark as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        {notif.actionUrl && (
          <Link
            href={notif.actionUrl}
            className="text-2xs text-primary-600 hover:underline font-medium px-1"
          >
            View
          </Link>
        )}
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <span className="h-2 w-2 rounded-full bg-primary-600 shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<MockNotification[]>(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter !== 'all') return n.type === activeFilter;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-white border-b border-neutral-200 z-10">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-neutral-700" />
          <h1 className="text-lg font-bold text-neutral-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-600 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-neutral-100 overflow-x-auto scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors',
              activeFilter === tab.key
                ? 'bg-primary-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100',
            )}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-white/25 text-white text-2xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 px-4">
          <Bell className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
          <p className="font-medium text-neutral-600">
            {activeFilter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            {activeFilter === 'unread'
              ? 'You have no unread notifications.'
              : "We'll notify you about matches, messages, and more."}
          </p>
        </div>
      ) : (
        <div>
          {filtered.map((notif) => (
            <NotificationItem key={notif.id} notif={notif} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
