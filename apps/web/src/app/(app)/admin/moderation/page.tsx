'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RekognitionScoreBar } from '@/components/RekognitionScoreBar';
import { DetectionLabelChip } from '@/components/DetectionLabelChip';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/graphql';
import {
  ADMIN_MODERATION_QUEUE_QUERY,
  ADMIN_MODERATION_STATS_QUERY,
  ADMIN_APPROVE_PHOTO_MUTATION,
  ADMIN_REJECT_PHOTO_MUTATION,
  ADMIN_RESOLVE_APPEAL_MUTATION,
} from '@/lib/queries';
import { cn, formatRelative, initials } from '@/lib/utils';

type QueueStatus = 'pending' | 'pending_human' | 'appealing' | 'all';

interface DetectionLabel {
  name: string;
  confidence: number;
  category?: string;
}

interface Appeal {
  id: string;
  reason: string;
  submittedAt: string;
  status: string;
}

interface QueueItem {
  id: string;
  userId: string;
  photoKey: string;
  photoUrl?: string;
  status: string;
  source: string;
  rekognitionScore?: number;
  detectionLabels: DetectionLabel[];
  submittedAt: string;
  appeal?: Appeal | null;
  user: {
    id: string;
    email: string;
    profile?: { displayName: string };
  };
}

interface ModerationStats {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  pendingAppeals: number;
  avgProcessingTimeMs: number;
}

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
      <p className="text-xs text-neutral-500 font-medium mb-1">{label}</p>
      <p className={cn('text-2xl font-bold text-neutral-900', color)}>{value}</p>
    </div>
  );
}

function SourceChip({ source }: { source: string }) {
  const isAuto = source === 'rekognition' || source === 'auto';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
        isAuto
          ? 'bg-secondary-100 text-secondary-700 border-secondary-200'
          : 'bg-neutral-100 text-neutral-600 border-neutral-200',
      )}
    >
      {isAuto ? 'AI' : 'Manual'}
    </span>
  );
}

interface QueueRowProps {
  item: QueueItem;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onResolveAppeal: (appealId: string, decision: 'approve' | 'uphold' | 'request_info', note?: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isLoading: boolean;
}

function QueueRow({
  item,
  onApprove,
  onReject,
  onResolveAppeal,
  isExpanded,
  onToggleExpand,
  isLoading,
}: QueueRowProps) {
  const [rejectNote, setRejectNote] = useState('');
  const [appealNote, setAppealNote] = useState('');
  const displayName = item.user.profile?.displayName ?? item.user.email;
  const hasAppeal = !!item.appeal;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
      {/* Main row */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Photo thumb */}
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={displayName}
            className="h-14 w-14 rounded-lg object-cover shrink-0 border border-neutral-200"
          />
        ) : (
          <Avatar className="h-14 w-14 rounded-lg shrink-0">
            <AvatarFallback className="rounded-lg text-lg">{initials(displayName)}</AvatarFallback>
          </Avatar>
        )}

        {/* User info + rekognition */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-neutral-800 truncate">{displayName}</p>
            <SourceChip source={item.source} />
            {hasAppeal && (
              <Badge variant="warning" className="text-2xs">
                Appeal pending
              </Badge>
            )}
          </div>

          <p className="text-xs text-neutral-400">{formatRelative(item.submittedAt)}</p>

          {/* Detection labels */}
          {item.detectionLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.detectionLabels.slice(0, 4).map((label) => (
                <DetectionLabelChip
                  key={label.name}
                  label={label.name}
                  confidence={label.confidence}
                  category={label.category}
                />
              ))}
              {item.detectionLabels.length > 4 && (
                <span className="text-xs text-neutral-400 self-center">
                  +{item.detectionLabels.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Rekognition score */}
        {item.rekognitionScore !== undefined && (
          <div className="w-28 shrink-0">
            <RekognitionScoreBar
              score={item.rekognitionScore}
              label="Confidence"
            />
          </div>
        )}

        {/* Status + quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          {item.status === 'pending' || item.status === 'pending_human' ? (
            <>
              <Button
                variant="success"
                size="xs"
                disabled={isLoading}
                onClick={() => onApprove(item.id)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                variant="danger"
                size="xs"
                disabled={isLoading}
                onClick={onToggleExpand}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          ) : item.status === 'appealing' ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={onToggleExpand}
              className="gap-1"
            >
              Review appeal
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          ) : (
            <Badge
              variant={item.status === 'approved' ? 'success' : 'error'}
              className="capitalize"
            >
              {item.status}
            </Badge>
          )}

          {(item.status === 'pending' || item.status === 'pending_human') && (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
              className="h-7 w-7 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="border-t border-neutral-100 px-4 py-4 bg-neutral-50 space-y-4">
          {/* Appeal details */}
          {hasAppeal && (
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                User appeal
              </p>
              <p className="text-sm text-neutral-700 leading-relaxed">{item.appeal!.reason}</p>
              <p className="text-xs text-neutral-400 mt-1">{formatRelative(item.appeal!.submittedAt)}</p>
            </div>
          )}

          {/* Reject / appeal actions */}
          {item.status !== 'approved' && item.status !== 'rejected' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-1 block">
                  {hasAppeal ? 'Decision note (optional)' : 'Rejection reason (optional)'}
                </label>
                <Textarea
                  rows={3}
                  value={hasAppeal ? appealNote : rejectNote}
                  onChange={(e) =>
                    hasAppeal ? setAppealNote(e.target.value) : setRejectNote(e.target.value)
                  }
                  placeholder={
                    hasAppeal
                      ? 'Add a note visible to the user…'
                      : 'Explain why this photo is rejected (visible to user)…'
                  }
                  className="text-sm"
                />
              </div>

              {hasAppeal ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => onResolveAppeal(item.appeal!.id, 'approve', appealNote || undefined)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve (uphold appeal)
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => onResolveAppeal(item.appeal!.id, 'uphold', appealNote || undefined)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject (uphold decision)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => onResolveAppeal(item.appeal!.id, 'request_info', appealNote || undefined)}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Request more info
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => onApprove(item.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => onReject(item.id, rejectNote || undefined)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Confirm rejection
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminModerationPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [filter, setFilter] = useState<QueueStatus>('pending_human');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const client = createClient();
      const [queueData, statsData] = await Promise.all([
        client.request<{ adminModerationQueue: { total: number; items: QueueItem[] } }>(
          ADMIN_MODERATION_QUEUE_QUERY,
          { status: filter === 'all' ? undefined : filter, limit: 50 },
        ),
        client.request<{ adminModerationStats: ModerationStats }>(ADMIN_MODERATION_STATS_QUERY),
      ]);
      setItems(queueData.adminModerationQueue.items);
      setStats(statsData.adminModerationStats);
    } catch {
      // Error loading — keep previous state
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(photoId: string) {
    setActionLoading(photoId);
    try {
      const client = createClient();
      await client.request(ADMIN_APPROVE_PHOTO_MUTATION, { photoId });
      setItems((prev) => prev.filter((i) => i.id !== photoId));
    } catch {
      // Action failed
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(photoId: string, reason?: string) {
    setActionLoading(photoId);
    try {
      const client = createClient();
      await client.request(ADMIN_REJECT_PHOTO_MUTATION, { photoId, reason });
      setItems((prev) => prev.filter((i) => i.id !== photoId));
    } catch {
      // Action failed
    } finally {
      setActionLoading(null);
      setExpandedId(null);
    }
  }

  async function handleResolveAppeal(
    appealId: string,
    decision: 'approve' | 'uphold' | 'request_info',
    note?: string,
  ) {
    setActionLoading(appealId);
    try {
      const client = createClient();
      await client.request(ADMIN_RESOLVE_APPEAL_MUTATION, { appealId, decision, note });
      setItems((prev) => prev.filter((i) => i.appeal?.id !== appealId));
    } catch {
      // Action failed
    } finally {
      setActionLoading(null);
      setExpandedId(null);
    }
  }

  const FILTERS: { label: string; value: QueueStatus }[] = [
    { label: 'Pending review', value: 'pending_human' },
    { label: 'Pending scan', value: 'pending' },
    { label: 'Appeals', value: 'appealing' },
    { label: 'All', value: 'all' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Photo Moderation</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Review flagged uploads and appeal decisions</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="gap-1.5" disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats widget */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Pending review" value={stats.pendingCount} color="text-warning-700" />
          <StatCard label="Approved today" value={stats.approvedToday} color="text-success-700" />
          <StatCard label="Rejected today" value={stats.rejectedToday} color="text-error-700" />
          <StatCard label="Pending appeals" value={stats.pendingAppeals} color="text-primary-700" />
        </div>
      )}

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors duration-[150ms]',
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Queue */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-success-400 mb-3" />
          <p className="text-lg font-semibold text-neutral-700">Queue is clear</p>
          <p className="text-sm text-neutral-400 mt-1">No items match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <QueueRow
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggleExpand={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
              onApprove={handleApprove}
              onReject={handleReject}
              onResolveAppeal={handleResolveAppeal}
              isLoading={actionLoading === item.id || actionLoading === item.appeal?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
