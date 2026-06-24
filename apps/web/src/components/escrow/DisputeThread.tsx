'use client';

import { cn } from '@/lib/utils';
import type { DisputeMessage } from '@/types/escrow';

interface DisputeThreadProps {
  messages: DisputeMessage[];
}

export function DisputeThread({ messages }: DisputeThreadProps) {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-2">
        No messages yet. Be the first to respond.
      </p>
    );
  }

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Dispute thread"
      className="space-y-3"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'rounded-xl p-4 text-sm',
            msg.authorRole === 'mediator'
              ? 'bg-primary-50 border border-primary-200'
              : 'bg-neutral-50 border border-neutral-200',
          )}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-neutral-900">{msg.authorName}</span>
            {msg.authorRole === 'mediator' && (
              <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">
                V.B Mediator
              </span>
            )}
            <span className="text-xs text-neutral-400 ml-auto">
              {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <p className="text-neutral-700 whitespace-pre-wrap">{msg.content}</p>
        </div>
      ))}
    </div>
  );
}
