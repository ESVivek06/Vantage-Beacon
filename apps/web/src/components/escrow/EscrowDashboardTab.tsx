'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EscrowCard } from './EscrowCard';
import { EscrowCreateModal } from './EscrowCreateModal';
import { AcceptDeclineModal } from './AcceptDeclineModal';
import { ReleaseConfirmModal } from './ReleaseConfirmModal';
import type { Escrow, EscrowMilestone } from '@/types/escrow';

interface EscrowDashboardTabProps {
  viewerRole: 'founder' | 'counterparty';
  viewerName?: string;
}

type Tab = 'active' | 'pending' | 'completed' | 'disputed';

const FOUNDER_TABS: { id: Tab; label: string }[] = [
  { id: 'active',    label: 'Active' },
  { id: 'pending',   label: 'Pending acceptance' },
  { id: 'completed', label: 'Completed' },
];

const COUNTERPARTY_TABS: { id: Tab; label: string }[] = [
  { id: 'pending',   label: 'Pending' },
  { id: 'active',    label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'disputed',  label: 'Disputed' },
];

function escrowMatchesTab(e: Escrow, tab: Tab): boolean {
  if (tab === 'active')    return e.status === 'IN_PROGRESS' || e.status === 'ACCEPTED' || e.status === 'MILESTONE_RELEASED';
  if (tab === 'pending')   return e.status === 'INITIATED';
  if (tab === 'completed') return e.status === 'COMPLETED' || e.status === 'DECLINED' || e.status === 'RESOLVED' || e.status === 'REFUNDED';
  if (tab === 'disputed')  return e.status === 'DISPUTED';
  return false;
}

export function EscrowDashboardTab({ viewerRole, viewerName }: EscrowDashboardTabProps) {
  const router = useRouter();
  const tabs = viewerRole === 'founder' ? FOUNDER_TABS : COUNTERPARTY_TABS;
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0].id);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [acceptTarget, setAcceptTarget] = useState<Escrow | null>(null);
  const [acceptMode, setAcceptMode] = useState<'accept' | 'decline'>('accept');
  const [releaseTarget, setReleaseTarget] = useState<Escrow | null>(null);
  const [releaseMilestone, setReleaseMilestone] = useState<EscrowMilestone | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/escrow');
      const data: Escrow[] = await res.json();
      setEscrows(Array.isArray(data) ? data : []);
    } catch {
      setEscrows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleRelease(escrowId: string) {
    const e = escrows.find((x) => x.id === escrowId);
    if (!e) return;
    const nextMilestone = e.milestones.find((m) => m.status === 'PENDING') ?? null;
    setReleaseTarget(e);
    setReleaseMilestone(nextMilestone);
  }

  function handleAccept(escrowId: string) {
    const e = escrows.find((x) => x.id === escrowId);
    if (e) { setAcceptTarget(e); setAcceptMode('accept'); }
  }

  function handleDecline(escrowId: string) {
    const e = escrows.find((x) => x.id === escrowId);
    if (e) { setAcceptTarget(e); setAcceptMode('decline'); }
  }

  const visibleEscrows = escrows.filter((e) => escrowMatchesTab(e, activeTab));

  const tabCounts = tabs.reduce<Record<Tab, number>>(
    (acc, t) => { acc[t.id] = escrows.filter((e) => escrowMatchesTab(e, t.id)).length; return acc; },
    {} as Record<Tab, number>,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">
          {viewerRole === 'founder' ? 'Escrow' : 'Payments & Escrow'}
        </h2>
        {viewerRole === 'founder' && (
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New escrow
          </Button>
        )}
      </div>

      {/* Tab bar */}
      <div role="tablist" aria-label="Escrow sections" className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            aria-controls={`escrow-panel-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              activeTab === t.id
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            {t.label}
            {tabCounts[t.id] > 0 && (
              <span className={cn(
                'text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center',
                activeTab === t.id ? 'bg-white/20 text-white' : 'bg-neutral-300 text-neutral-700',
              )}>
                {tabCounts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel */}
      <section
        id={`escrow-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`escrow-tab-${activeTab}`}
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : visibleEscrows.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-10 text-center">
            {viewerRole === 'founder' ? (
              <>
                <Banknote className="h-10 w-10 text-neutral-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-neutral-700 mb-1">No {activeTab} escrows</p>
                <p className="text-xs text-neutral-500 mb-4">Create your first escrow to get started.</p>
                {activeTab !== 'completed' && (
                  <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>Create escrow</Button>
                )}
              </>
            ) : (
              <>
                <Clock className="h-10 w-10 text-neutral-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-neutral-700 mb-1">No {activeTab} payments</p>
                <p className="text-xs text-neutral-500">When a founder creates an escrow with you, it&apos;ll appear here.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleEscrows.map((e) => (
              <EscrowCard
                key={e.id}
                escrow={e}
                viewerRole={viewerRole}
                onViewDetails={(id) => router.push(`/escrow/${id}`)}
                onRelease={handleRelease}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onRequestRelease={(id) => router.push(`/escrow/${id}`)}
                onViewDispute={(id) => router.push(`/escrow/${id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showCreate && (
        <EscrowCreateModal
          counterpartyId=""
          counterpartyName="Select counterparty"
          counterpartyRole="Freelancer / Supplier"
          onClose={() => setShowCreate(false)}
          onCreated={(id) => { setShowCreate(false); load(); router.push(`/escrow/${id}`); }}
        />
      )}

      {acceptTarget && (
        <AcceptDeclineModal
          escrow={acceptTarget}
          mode={acceptMode}
          onClose={() => setAcceptTarget(null)}
          onDone={() => { setAcceptTarget(null); load(); }}
        />
      )}

      {releaseTarget && releaseMilestone && (
        <ReleaseConfirmModal
          escrowId={releaseTarget.id}
          milestone={releaseMilestone}
          currency={releaseTarget.currency}
          counterpartyName={releaseTarget.counterparty.name}
          onClose={() => { setReleaseTarget(null); setReleaseMilestone(null); }}
          onReleased={() => { setReleaseTarget(null); setReleaseMilestone(null); load(); }}
        />
      )}
    </div>
  );
}
