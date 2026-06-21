'use client';

import { Handshake, MessageSquare, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { cn, formatRelative } from '@/lib/utils';
import type { MockNotification } from '@/lib/messaging-mock-data';

interface NotificationRowProps {
  notification: MockNotification;
  onMarkRead?: (id: string) => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

const TYPE_CONFIG = {
  match: {
    Icon: Handshake,
    iconBg: 'bg-secondary-100',
    iconText: 'text-secondary-600',
    borderColor: 'border-l-secondary-500',
    label: 'New Match',
    cta: 'View profile →',
  },
  message: {
    Icon: MessageSquare,
    iconBg: 'bg-primary-100',
    iconText: 'text-primary-600',
    borderColor: 'border-l-primary-500',
    label: 'New Message',
    cta: 'Reply →',
  },
  connection: {
    Icon: UserPlus,
    iconBg: 'bg-success-100',
    iconText: 'text-success-700',
    borderColor: 'border-l-success-600',
    label: 'Connection Request',
    cta: null,
  },
  opportunity: {
    Icon: AlertCircle,
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    borderColor: 'border-l-accent-600',
    label: 'Opportunity',
    cta: 'View →',
  },
  system: {
    Icon: AlertCircle,
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    borderColor: 'border-l-accent-600',
    label: 'System Alert',
    cta: 'Complete profile →',
  },
} as const;

export function NotificationRow({
  notification,
  onMarkRead,
  onAccept,
  onDecline,
}: NotificationRowProps) {
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;
  const { Icon } = config;

  const isConnectionRequest =
    notification.type === 'connection' && notification.title.toLowerCase().includes('request');

  function handleClick() {
    if (!notification.read) onMarkRead?.(notification.id);
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b border-neutral-100',
        'hover:bg-neutral-50 transition-colors duration-[150ms] cursor-pointer',
        'min-h-[72px]',
        notification.read
          ? 'border-l-4 border-l-transparent'
          : cn('border-l-4', config.borderColor, 'bg-primary-50/20'),
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          config.iconBg,
        )}
      >
        <Icon className={cn('h-4 w-4', config.iconText)} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
          {config.label}
        </p>
        <p className="text-sm text-neutral-800 leading-snug mb-1">{notification.body}</p>

        {isConnectionRequest ? (
          <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
            <Button
              variant="primary"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onAccept?.(notification.id);
              }}
            >
              Accept
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onDecline?.(notification.id);
              }}
            >
              Decline
            </Button>
          </div>
        ) : config.cta && notification.actionUrl ? (
          <a
            href={notification.actionUrl}
            className="text-xs font-medium text-primary-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {config.cta}
          </a>
        ) : null}
      </div>

      {/* Timestamp */}
      <span className="text-xs text-neutral-400 shrink-0 mt-0.5">
        {formatRelative(notification.createdAt)}
      </span>
    </div>
  );
}
