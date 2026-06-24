'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, initials } from '@/lib/utils';
import { MilestoneList } from '@/components/escrow/MilestoneList';
import { EscrowTimeline } from '@/components/escrow/EscrowTimeline';
import { DisputeThread } from '@/components/escrow/DisputeThread';
import { ReleaseConfirmModal } from '@/components/escrow/ReleaseConfirmModal';
import { DisputeModal } from '@/components/escrow/DisputeModal';
import type { Escrow, EscrowMilestone } from '@/types/escrow';

export default function EscrowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role ?? 'freelancer';
  const viewerRole: 'founder' | 'counterparty' = userRole === 'founder' ? 'founder' : 'counterparty';

  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRelease, setShowRelease] = useState(false);
  const [releaseMilestone, setReleaseMilestone] = useState<EscrowMilestone | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [showRespond, setShowRespond] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/escrow/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data: Escrow = await res.json();
      setEscrow(data);
    } catch {
      setError('Could not load escrow details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="h-6 w-32 bg-neutral-100 rounded animate-pulse" />
        <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-error-50 border border-error-200 rounded-xl p-6 text-center">
          <p className="text-error-700 mb-4">{error || 'Escrow not found.'}</p>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        </div>
      </div>
    );
  }

  const nextPendingMilestone = escrow.milestones.find((m) => m.status === 'PENDING') ?? null;
  const isDisputed = escrow.status === 'DISPUTED';
  const canRelease = viewerRole === 'founder' && nextPendingMilestone && !isDisputed;
  const canOpenDispute = !isDisputed && (escrow.status === 'IN_PROGRESS' || escrow.status === 'ACCEPTED' || escrow.status === 'MILESTONE_RELEASED');

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusLabel: Record<string, string> = {
    IN_PROGRESS: 'In Progress',
    ACCEPTED: 'Accepted',
    INITIATED: 'Pending',
    MILESTONE_RELEASED: 'Milestone Released',
    COMPLETED: 'Completed',
    DECLINED: 'Declined',
    DISPUTED: 'Disputed',
    RESOLVED: 'Resolved',
    REFUNDED: 'Refunded',
  };

  const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    IN_PROGRESS: 'success',
    ACCEPTED: 'success',
    INITIATED: 'warning',
    MILESTONE_RELEASED: 'success',
    COMPLETED: 'neutral',
    DECLINED: 'neutral',
    DISPUTED: 'error',
    RESOLVED: 'neutral',
    REFUNDED: 'neutral',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Back + title */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-3"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-neutral-900">&ldquo;{escrow.title}&rdquo;</h1>
          <Badge variant={statusVariant[escrow.status] ?? 'neutral'} className="shrink-0">
            {statusLabel[escrow.status] ?? escrow.status}
          </Badge>
        </div>
      </div>

      {/* Parties */}
      <section className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Founder', party: escrow.founder },
          { label: 'Freelancer / Supplier', party: escrow.counterparty },
        ].map(({ label, party }) => (
          <div key={label} className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={party.avatarUrl} alt={party.name} />
              <AvatarFallback>{initials(party.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-neutral-500 font-medium">{label}</p>
              <p className="text-sm font-semibold text-neutral-900">{party.name}</p>
              <p className="text-xs text-neutral-500">{party.role}</p>
              {party.trustTier !== undefined && (
                <span className="text-xs text-primary-600">Trust Tier {party.trustTier}</span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Details */}
      <section className="bg-neutral-0 border border-neutral-200 rounded-xl p-4 space-y-2">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Escrow details</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Total amount</p>
            <p className="font-medium text-neutral-900">
              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: escrow.currency, maximumFractionDigits: 0 }).format(escrow.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Created</p>
            <p className="font-medium text-neutral-900">{formatDate(escrow.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Currency</p>
            <p className="font-medium text-neutral-900">{escrow.currency}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Type</p>
            <p className="font-medium text-neutral-900 capitalize">
              {escrow.paymentStructure === 'single' ? 'Single payment' : 'Milestone'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-neutral-500">Reference</p>
            <code className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">{escrow.ref}</code>
          </div>
        </div>
        <div className="pt-2 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 mb-1">Release conditions</p>
          <p className="text-sm text-neutral-700 italic">&ldquo;{escrow.releaseConditions}&rdquo;</p>
        </div>
      </section>

      {/* Milestones */}
      {escrow.paymentStructure === 'milestone' && (
        <section className="bg-neutral-0 border border-neutral-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Milestones</h2>
          <MilestoneList
            milestones={escrow.milestones}
            currency={escrow.currency}
            viewerRole={viewerRole}
            onRelease={(milestoneId) => {
              const m = escrow.milestones.find((x) => x.id === milestoneId) ?? null;
              setReleaseMilestone(m);
              setShowRelease(true);
            }}
          />
        </section>
      )}

      {/* Timeline */}
      <section className="bg-neutral-0 border border-neutral-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Timeline</h2>
        <EscrowTimeline events={escrow.timeline} />
      </section>

      {/* Dispute section */}
      {escrow.dispute && (
        <section className="bg-neutral-0 border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700">Dispute</h2>
            <span className="text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
              {escrow.dispute.ref}
            </span>
          </div>

          <div className="text-sm space-y-1 mb-4">
            <p><span className="text-neutral-500">Status:</span> <span className="font-medium text-neutral-900 capitalize">{escrow.dispute.status.replace('_', ' ')}</span></p>
            <p><span className="text-neutral-500">Opened by:</span> {escrow.dispute.openedBy}</p>
            <p><span className="text-neutral-500">Date:</span> {formatDate(escrow.dispute.openedAt)}</p>
            <p><span className="text-neutral-500">Reason:</span> {escrow.dispute.reason}</p>
          </div>

          <DisputeThread messages={escrow.dispute.messages} />

          {escrow.dispute.status === 'OPEN' || escrow.dispute.status === 'UNDER_REVIEW' ? (
            <div className="flex flex-wrap gap-2 mt-4">
              {viewerRole === 'counterparty' && (
                <Button variant="secondary" size="sm" onClick={() => setShowRespond(true)}>
                  Respond to dispute
                </Button>
              )}
              <Button variant="success" size="sm" onClick={async () => {
                await fetch(`/api/escrow/${escrow.id}/disputes/${escrow.dispute!.id}/resolve`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ outcome: 'RESOLVED' }),
                });
                load();
              }}>
                Accept resolution
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-error-600 hover:text-error-700"
                onClick={async () => {
                  await fetch(`/api/escrow/${escrow.id}/disputes/${escrow.dispute!.id}/resolve`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ outcome: 'REFUNDED' }),
                  });
                  load();
                }}
              >
                Request refund
              </Button>
            </div>
          ) : null}
        </section>
      )}

      {/* Sticky action bar */}
      <div className={cn(
        'sticky bottom-0 bg-neutral-0 border-t border-neutral-200 p-4 flex flex-wrap gap-3 justify-end',
        '-mx-4 sm:-mx-6 rounded-b-none',
      )}>
        {canOpenDispute && !escrow.dispute && (
          <Button
            variant="ghost"
            size="md"
            className="text-neutral-700 hover:text-error-600"
            onClick={() => setShowDispute(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Open a dispute
          </Button>
        )}
        {canRelease && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setReleaseMilestone(nextPendingMilestone);
              setShowRelease(true);
            }}
            aria-label={`Release milestone to ${escrow.counterparty.name}`}
          >
            {escrow.paymentStructure === 'milestone'
              ? `Release milestone ${escrow.milestones.filter((m) => m.status === 'RELEASED').length + 1}`
              : 'Release payment'}
          </Button>
        )}
      </div>

      {/* Release modal */}
      {showRelease && releaseMilestone && (
        <ReleaseConfirmModal
          escrowId={escrow.id}
          milestone={releaseMilestone}
          currency={escrow.currency}
          counterpartyName={escrow.counterparty.name}
          onClose={() => { setShowRelease(false); setReleaseMilestone(null); }}
          onReleased={() => { setShowRelease(false); setReleaseMilestone(null); load(); }}
        />
      )}

      {/* Dispute modal */}
      {showDispute && (
        <DisputeModal
          escrow={escrow}
          mode="open"
          onClose={() => setShowDispute(false)}
          onDone={() => { setShowDispute(false); load(); }}
        />
      )}

      {/* Respond modal */}
      {showRespond && escrow.dispute && (
        <DisputeModal
          escrow={escrow}
          mode="respond"
          disputeId={escrow.dispute.id}
          onClose={() => setShowRespond(false)}
          onDone={() => { setShowRespond(false); load(); }}
        />
      )}
    </div>
  );
}
