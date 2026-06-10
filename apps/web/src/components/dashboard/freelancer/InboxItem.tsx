import { cn, formatRelative } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';

export interface InboxItemProps {
  id: string;
  senderName: string;
  senderPhotoUrl?: string;
  preview: string;
  timestamp: string;
  unread?: boolean;
  type?: 'connection_request' | 'message' | 'notification';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function InboxItem({
  id,
  senderName,
  senderPhotoUrl,
  preview,
  timestamp,
  unread = false,
  type = 'message',
  onAccept,
  onDecline,
}: InboxItemProps) {
  return (
    <li
      className={cn(
        'flex gap-3 bg-white rounded-xl border border-neutral-200 shadow-xs p-4',
        unread && 'border-primary-200 bg-primary-50/30',
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          {senderPhotoUrl && <AvatarImage src={senderPhotoUrl} alt={senderName} />}
          <AvatarFallback className="text-sm bg-primary-100 text-primary-700 font-semibold">
            {initials(senderName)}
          </AvatarFallback>
        </Avatar>
        {unread && (
          <span
            className="absolute -top-0.5 -right-0.5 rounded-full bg-primary-600 border-2 border-white"
            style={{ width: 8, height: 8 }}
            aria-label="Unread message"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p
            className="truncate text-neutral-900"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            {senderName}
          </p>
          <time className="text-xs text-neutral-400 shrink-0 ml-2">{formatRelative(timestamp)}</time>
        </div>
        <p className="text-xs text-neutral-500 line-clamp-1">{preview}</p>
        {type === 'connection_request' && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onAccept?.(id)}
              aria-label={`Accept connection from ${senderName}`}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            >
              Accept
            </button>
            <button
              onClick={() => onDecline?.(id)}
              aria-label={`Decline connection from ${senderName}`}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
