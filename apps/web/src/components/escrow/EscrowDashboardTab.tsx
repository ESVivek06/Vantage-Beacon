'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EscrowCard } from './EscrowCard';
import { EscrowCreateModal } from './EscrowCreateModal';
import { AcceptDeclineModal } from './AcceptDeclineModal';
import { ReleaseConfirmModal } from './ReleaseConfirmModal';
import type { Escrow, EscrowStatus } from '@/types/escrow';

const FOUNDER_TABS = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
] as const;

const COUNTERPARTY_TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'disputed', label: 'Disputed' },
] as const;

type FounderTabId = 'active' | 'pending' | 'completed';
type CounterpartyTabId = 'pending' | 'active' | 'completed' | 'disputed';
type TabId = FounderTabId | CounterpartyTabId;

function escrowMatchesTab(escrow: Escrow, tab: TabId, role: 'founder' | 'counterparty'): boolean {
  const s: EscrowStatus = escrow.status;
  if (tab === 'active') return s === 'IN_PROGRESS' || s === 'ACCEPTED' || s === 'MILESTONE_RELEASED';
  if (tab === 'pending') return s === 'INITIATED';
  if (tab === 'completed') return s === 'COMPLETED' || s === 'RESOLVED' || s === 'REFUNDED' || s === 'DECLINED';
  if (tab === 'disputed') return s === 'DISPUTED';
  return false;
}

interface EscrowDashboardTabProps {
  viewerRole: 'founder' | 'counterparty';
  viewerName: string;
}

export function EscrowDashboardTab({ viewerRole, viewerName }: EscrowDashboardTabProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>(viewerRole === 'founder' ? 'active' : 'pending');
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [acceptEscrow, setAcceptEscrow] = useState<{ escrow: Escrow; mode: 'accept' | 'decline' } | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<{ escrow: Escrow } | null>(null);

  useEffect(() => {
    fetch('/api/escrow')
      .then((r) => r.ok ? r.json() : [])
      .then((data: Escrow[]) => { setEscrows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tabs = viewerRole === 'founder' ? FOUNDER_TABS : COUNTERPARTY_TABS;
  const filtered = escrows.filter((e) => escrowMatchesTab(e, activeTab, viewerRole));

  function refresh() {
    setLoading(true);
    fetch('/api/escrow')
      .then((r) => r.ok ? r.json() : [])
      .then((data: Escrow[]) => { setEscrows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  const releaseEscrow = releaseTarget?.escrow;
  const releaseMilestone = releaseEscrow?.milestones.find((m) => m.status === 'PENDING');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-neutral-900">
          {viewerRole === 'founder' ? 'Escrow agreements' : 'Payments & Escrow'}
        </h2>
        {viewerRole === 'founder' && (
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            New escrow
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex gap-0.5 mb-4 border-b border-neutral-100">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id as TabId)}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === id
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center">
          {activeTab === 'pending' ? (
            <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          ) : (
            <Banknote className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          )}
          <p className="text-sm text-neutral-500">
            {activeTab === 'pending' ? 'No pending agreements' : `No ${activeTab} escrows`}
          </p>
          {viewerRole === 'founder' && activeTab === 'active' && (
            <Button variant="primary" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
              Create your first escrow
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((escrow) => (
            <EscrowCard
              key={escrow.id}
              escrow={escrow}
              viewerRole={viewerRole}
              onViewDetails={(id) => router.push(`/escrow/${id}`)}
              onRelease={(id) => {
                const e = escrows.find((x) => x.id === id);
                if (e) setReleaseTarget({ escrow: e });
              }}
              onAccept={(id) => {
                const e = escrows.find((x) => x.id === id);
                if (e) setAcceptEscrow({ escrow: e, mode: 'accept' });
              }}
              onDecline={(id) => {
                const e = escrows.find((x) => x.id === id);
                if (e) setAcceptEscrow({ escrow: e, mode: 'decline' });
              }}
              onRequestRelease={(id) => router.push(`/escrow/${id}`)}
              onViewDispute={(id) => router.push(`/escrow/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <EscrowCreateModal
          viewerName={viewerName}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => { setShowCreate(false); refresh(); router.push(`/escrow/${id}`); }}
        />
      )}

      {acceptEscrow && (
        <AcceptDeclineModal
          escrow={acceptEscrow.escrow}
          initialMode={acceptEscrow.mode}
          onClose={() => setAcceptEscrow(null)}
          onAccepted={() => { setAcceptEscrow(null); refresh(); }}
          onDeclined={() => { setAcceptEscrow(null); refresh(); }}
        />
      )}

      {releaseEscrow && releaseMilestone && (
        <ReleaseConfirmModal
          escrow={releaseEscrow}
          milestone={releaseMilestone}
          onClose={() => setReleaseTarget(null)}
          onReleased={() => { setReleaseTarget(null); refresh(); }}
        />
      )}
    </div>
  );
}
