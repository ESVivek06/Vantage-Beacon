'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, MessageSquare, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { initials } from '@/lib/utils';
import { cn } from '@/lib/utils';

export type PortfolioConnectionStatus = 'meeting_booked' | 'interest_sent' | 'connected';

export interface PortfolioConnection {
  id: string;
  founderName: string;
  startupName?: string;
  photoUrl?: string;
  role?: string;
  location?: string;
  stage?: string;
  sector?: string;
  connectedAt: string;
  status: PortfolioConnectionStatus;
}

const STATUS_CONFIG: Record<PortfolioConnectionStatus, { label: string; className: string }> = {
  meeting_booked: {
    label: 'Meeting Booked',
    className: 'bg-success-100 text-success-700',
  },
  interest_sent: {
    label: 'Interest Sent',
    className: 'bg-warning-100 text-warning-700',
  },
  connected: {
    label: 'Connected',
    className: 'bg-primary-100 text-primary-700',
  },
};

function ConnectionItem({ conn }: { conn: PortfolioConnection }) {
  const { label, className } = STATUS_CONFIG[conn.status];
  const display = conn.startupName ?? conn.founderName;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-3 items-start">
      <Avatar className="h-10 w-10 shrink-0">
        {conn.photoUrl && <AvatarImage src={conn.photoUrl} alt={display} />}
        <AvatarFallback className="bg-warning-100 text-warning-700 text-sm font-semibold">
          {initials(display)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{display}</p>
            <p className="text-xs text-neutral-500 truncate">
              {conn.founderName}
              {conn.stage && ` · ${conn.stage}`}
              {conn.sector && ` · ${conn.sector}`}
              {conn.location && ` · ${conn.location}`}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">{conn.connectedAt}</p>
          </div>
          <span className={cn('shrink-0 text-xs font-medium px-2 py-0.5 rounded-full', className)}>
            {label}
          </span>
        </div>

        {conn.status === 'meeting_booked' && (
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" size="sm">
              <MessageSquare className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Message
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              View profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface PortfolioPanelProps {
  connections?: PortfolioConnection[];
}

export function PortfolioPanel({ connections = [] }: PortfolioPanelProps) {
  const [passedExpanded, setPassedExpanded] = useState(false);

  const active = connections.filter((c) => c.status !== 'interest_sent' || true);
  const passed: PortfolioConnection[] = [];

  const meetingsBooked = connections.filter((c) => c.status === 'meeting_booked').length;
  const interestSent = connections.filter((c) => c.status === 'interest_sent').length;

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 flex flex-wrap gap-6">
        <div>
          <p className="text-2xl font-bold text-primary-700">{connections.length}</p>
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Active Connections</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-success-600">{meetingsBooked}</p>
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Meetings Booked</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-warning-600">{interestSent}</p>
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Awaiting Response</p>
        </div>
      </div>

      {/* Active connections */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Active connections</h3>
        {active.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-neutral-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-neutral-500">No connections yet.</p>
            <p className="text-xs text-neutral-400 mt-1">Express interest in deal flow to start building your portfolio.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((c) => <ConnectionItem key={c.id} conn={c} />)}
          </div>
        )}
      </div>

      {/* Passed (collapsed) */}
      {passed.length > 0 && (
        <div>
          <button
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700"
            onClick={() => setPassedExpanded(!passedExpanded)}
            aria-expanded={passedExpanded}
          >
            {passedExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            Passed ({passed.length})
          </button>
          {passedExpanded && (
            <div className="mt-2 space-y-2 opacity-60">
              {passed.map((c) => <ConnectionItem key={c.id} conn={c} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
