'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';
import { MilestoneList } from '@/components/escrow/MilestoneList';
import { EscrowTimeline } from '@/components/escrow/EscrowTimeline';
import { DisputeThread } from '@/components/escrow/DisputeThread';
import { ReleaseConfirmModal } from '@/components/escrow/ReleaseConfirmModal';
import { DisputeModal } from '@/components/escrow/DisputeModal';
import type { Escrow, EscrowMilestone } from '@/types/escrow';

export default function EscrowDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const viewerRole = ((session?.user as { role?: string })?.role === 'founder' ? 'founder' : 'counterparty') as 'founder' | 'counterparty';

  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [releaseModal, setReleaseModal] = useState<EscrowMilestone | null>(null);
  const [disputeModal, setDisputeModal] = useState<'open' | 'respond' | null>(null);

  useEffect(() => {
    fetch(`/api/escrow/${params.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data && !data.error) setEscrow(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const fmt = (v: number) =>
    escrow ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: escrow.currency, maximumFractionDigits: 0 }).format(v) : '';

  const nextPending = escrow?.milestones.find((m) => m.status === 'PENDING');
  const isDisputed = escrow?.status === 'DISPUTED';
  const canRelease = viewerRole === 'founder' && !!nextPending && !isDisputed;
  const canDispute = viewerRole === 'founder' && escrow?.status === 'IN_PROGRESS' && !isDisputed;
  const canRespond = viewerRole === 'counterparty' && isDisputed;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-neutral-100 animate-pulse" />)}
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 mb-4">Escrow not found.</p>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Top nav */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 truncate text-sm">{escrow.title}</p>
          <p className="text-xs text-neutral-500">
            <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">{escrow.ref}</code>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Dispute alert */}
        {isDisputed && escrow.dispute && (
          <div className="bg-error-50 border border-error-300 rounded-xl p-4 flex items-start gap-2 text-sm text-error-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Dispute active — payments paused</p>
              <p className="text-xs mt-0.5">Ref: {escrow.dispute.ref} · Opened {new Date(escrow.dispute.openedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        )}

        {/* Parties */}
        <section className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Parties</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Founder', party: escrow.founder },
              { label: 'Supplier', party: escrow.counterparty },
            ].map(({ label, party }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={party.avatarUrl} alt={party.name} />
                  <AvatarFallback className="text-xs">{initials(party.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{party.name}</p>
                  <p className="text-xs text-neutral-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Details */}
        <section className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Details</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div><dt className="text-neutral-500">Total</dt><dd className="font-semibold text-neutral-900">{fmt(escrow.totalAmount)}</dd></div>
            <div><dt className="text-neutral-500">Structure</dt><dd className="text-neutral-900">{escrow.paymentStructure === 'milestone' ? `${escrow.milestones.length} milestones` : 'Single payment'}</dd></div>
            <div><dt className="text-neutral-500">Status</dt><dd className="text-neutral-900">{escrow.status.replace(/_/g, ' ')}</dd></div>
            <div><dt className="text-neutral-500">Created</dt><dd className="text-neutral-900">{new Date(escrow.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
            <div className="col-span-2">
              <dt className="text-neutral-500 mb-1">Release conditions</dt>
              <dd className="text-neutral-700 bg-neutral-50 border-l-4 border-l-primary-400 px-3 py-2 rounded-r-lg">{escrow.releaseConditions}</dd>
            </div>
          </dl>
        </section>

        {/* Milestones */}
        {escrow.paymentStructure === 'milestone' && (
          <section className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Milestones</h2>
            <MilestoneList
              milestones={escrow.milestones}
              currency={escrow.currency}
              viewerRole={viewerRole}
              releasing={releasing}
              onRelease={(milestoneId) => {
                const m = escrow.milestones.find((x) => x.id === milestoneId);
                if (m) setReleaseModal(m);
              }}
            />
          </section>
        )}

        {/* Timeline */}
        {escrow.timeline.length > 0 && (
          <section className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Timeline</h2>
            <EscrowTimeline events={escrow.timeline} />
          </section>
        )}

        {/* Dispute thread */}
        {isDisputed && escrow.dispute && (
          <section className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Dispute thread</h2>
            <DisputeThread dispute={escrow.dispute} />
          </section>
        )}
      </div>

      {/* Sticky action bar */}
      {(canRelease || canDispute || canRespond) && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-4 py-3 flex gap-2 justify-end max-w-3xl mx-auto">
          {canRelease && nextPending && (
            <Button variant="primary" size="sm" onClick={() => setReleaseModal(nextPending)}>
              Release next milestone
            </Button>
          )}
          {canDispute && (
            <Button variant="secondary" size="sm" onClick={() => setDisputeModal('open')}>
              Open dispute
            </Button>
          )}
          {canRespond && (
            <Button variant="secondary" size="sm" onClick={() => setDisputeModal('respond')}>
              Respond to dispute
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {releaseModal && (
        <ReleaseConfirmModal
          escrow={escrow}
          milestone={releaseModal}
          onClose={() => setReleaseModal(null)}
          onReleased={() => {
            setReleaseModal(null);
            setEscrow((e) => e ? {
              ...e,
              milestones: e.milestones.map((m) =>
                m.id === releaseModal.id ? { ...m, status: 'RELEASED' as const, releasedAt: new Date().toISOString() } : m,
              ),
            } : e);
          }}
        />
      )}

      {disputeModal && (
        <DisputeModal
          escrow={escrow}
          mode={disputeModal}
          onClose={() => setDisputeModal(null)}
          onSubmitted={() => { setDisputeModal(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
