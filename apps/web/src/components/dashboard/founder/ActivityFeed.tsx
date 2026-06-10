'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, formatRelative } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, UserPlus, Eye, MessageSquare } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'match' | 'connection' | 'view' | 'message';
  title: string;
  description?: string;
  timestamp: string;
  personName?: string;
  actionRequired?: boolean;
}

const TYPE_ICONS = {
  match: Sparkles,
  connection: UserPlus,
  view: Eye,
  message: MessageSquare,
};

const TYPE_COLORS: Record<string, string> = {
  match: 'bg-secondary-50 text-secondary-600',
  connection: 'bg-primary-50 text-primary-600',
  view: 'bg-amber-50 text-amber-600',
  message: 'bg-neutral-100 text-neutral-600',
};

export interface ActivityFeedProps {
  initialItems?: ActivityItem[];
  wsUrl?: string;
  maxItems?: number;
  onAccept?: (itemId: string) => void;
  onDecline?: (itemId: string) => void;
}

export function ActivityFeed({
  initialItems = [],
  wsUrl,
  maxItems = 20,
  onAccept,
  onDecline,
}: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>(initialItems);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!wsUrl) return;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          const item: ActivityItem = JSON.parse(event.data as string);
          setItems((prev) => [item, ...prev].slice(0, maxItems));
        } catch {
          // ignore malformed messages
        }
      };
      return () => ws.close();
    } catch {
      // ignore connection errors — feed degrades to static list
    }
  }, [wsUrl, maxItems]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-8 text-center">
        <p className="text-sm text-neutral-500">No activity yet.</p>
        <p className="text-xs text-neutral-400 mt-1">Events appear here in real time.</p>
      </div>
    );
  }

  return (
    <ul
      aria-live="polite"
      aria-label="Activity feed"
      aria-relevant="additions"
      className="space-y-2"
    >
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] ?? MessageSquare;
        return (
          <li
            key={item.id}
            className="flex items-start gap-3 bg-white rounded-xl border border-neutral-200 shadow-xs p-4"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                TYPE_COLORS[item.type] ?? TYPE_COLORS.message,
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
              {item.description && (
                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{item.description}</p>
              )}
              {item.actionRequired && item.personName && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAccept?.(item.id)}
                    aria-label={`Accept connection from ${item.personName}`}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDecline?.(item.id)}
                    aria-label={`Decline connection from ${item.personName}`}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
            <time
              className="text-xs text-neutral-400 shrink-0 whitespace-nowrap"
              dateTime={item.timestamp}
            >
              {formatRelative(item.timestamp)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
