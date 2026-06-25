import type { EscrowTimelineEvent } from '@/types/escrow';

interface EscrowTimelineProps {
  events: EscrowTimelineEvent[];
}

export function EscrowTimeline({ events }: EscrowTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-neutral-500 py-2">No timeline events yet.</p>;
  }

  return (
    <ol className="relative border-l-2 border-neutral-200 ml-2 space-y-4">
      {events.map((event) => (
        <li key={event.id} className="pl-5 relative">
          <span
            className="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-neutral-400 border-2 border-neutral-0"
            aria-hidden="true"
          />
          <p className="text-sm text-neutral-800">{event.description}</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {new Date(event.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {event.actor ? ` · ${event.actor}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
}
