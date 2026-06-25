'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle2, XCircle, Clock, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModerationBanner } from '@/components/ModerationBanner';
import { AppealModal } from '@/components/AppealModal';
import { cn } from '@/lib/utils';

export type UploadModerationState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'pending_human'
  | 'error';

interface PhotoUploadDropzoneProps {
  currentPhotoUrl?: string;
  moderationStatus?: UploadModerationState;
  referenceId?: string;
  onFileSelect: (file: File) => Promise<void>;
  onAppeal?: (reason: string) => Promise<{ referenceId: string }>;
  className?: string;
  disabled?: boolean;
}

const STATE_META: Record<
  Exclude<UploadModerationState, 'idle' | 'uploading' | 'error'>,
  { label: string; sublabel: string }
> = {
  processing: {
    label: 'Scanning photo…',
    sublabel: 'This usually takes under a minute.',
  },
  approved: {
    label: 'Photo approved',
    sublabel: 'Your photo is live on your profile.',
  },
  rejected: {
    label: 'Photo rejected',
    sublabel: 'Did not meet community guidelines.',
  },
  pending_human: {
    label: 'Pending human review',
    sublabel: 'A member of our team is reviewing your photo.',
  },
};

export function PhotoUploadDropzone({
  currentPhotoUrl,
  moderationStatus = 'idle',
  referenceId,
  onFileSelect,
  onAppeal,
  className,
  disabled = false,
}: PhotoUploadDropzoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [appealOpen, setAppealOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const displayUrl = localPreview ?? currentPhotoUrl;
  const isProcessing = moderationStatus === 'uploading' || moderationStatus === 'processing';

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    setBannerDismissed(false);
    onFileSelect(file);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
    [disabled],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-[150ms] min-h-[160px] overflow-hidden',
          isDragOver && !disabled
            ? 'border-primary-400 bg-primary-50'
            : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        {/* Photo preview (optimistic — shown immediately on upload) */}
        {displayUrl && (
          <img
            src={displayUrl}
            alt="Profile photo preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Overlay — shown when processing */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-2">
            <div className="h-8 w-8 rounded-full border-4 border-white/30 border-t-white animate-spin" aria-hidden="true" />
            <p className="text-sm font-medium">
              {moderationStatus === 'uploading' ? 'Uploading…' : 'Scanning photo…'}
            </p>
            <p className="text-xs text-white/70">This usually takes under a minute</p>
          </div>
        )}

        {/* Status overlay chips */}
        {!isProcessing && moderationStatus === 'approved' && displayUrl && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-600 text-white text-xs font-semibold shadow-sm">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Approved
            </span>
          </div>
        )}

        {!isProcessing && moderationStatus === 'rejected' && displayUrl && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-600 text-white text-xs font-semibold shadow-sm">
              <XCircle className="h-3 w-3" aria-hidden="true" />
              Rejected
            </span>
          </div>
        )}

        {!isProcessing && moderationStatus === 'pending_human' && displayUrl && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-500 text-white text-xs font-semibold shadow-sm">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Under review
            </span>
          </div>
        )}

        {/* Idle / empty state */}
        {!displayUrl && !isProcessing && (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-neutral-400" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-neutral-700">Drop a photo here, or</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Browse files
            </Button>
            <p className="text-xs text-neutral-400">JPG or PNG · max 5 MB</p>
          </div>
        )}

        {/* Replace button when photo exists and not processing */}
        {displayUrl && !isProcessing && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium transition-colors duration-[150ms] flex items-center gap-1.5"
            >
              <Upload className="h-3 w-3" />
              Replace
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Upload profile photo"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Moderation status banner */}
      {!bannerDismissed && moderationStatus !== 'idle' && moderationStatus !== 'uploading' && (
        <div aria-live="polite" aria-atomic="true">
          {moderationStatus === 'processing' && (
            <ModerationBanner status="pending" />
          )}
          {moderationStatus === 'approved' && (
            <ModerationBanner status="approved" onDismiss={() => setBannerDismissed(true)} />
          )}
          {moderationStatus === 'rejected' && (
            <ModerationBanner
              status="rejected"
              referenceId={referenceId}
              onAppeal={onAppeal ? () => setAppealOpen(true) : undefined}
            />
          )}
          {moderationStatus === 'pending_human' && (
            <ModerationBanner status="pending" />
          )}
          {moderationStatus === 'error' && (
            <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-50 border border-error-200 text-sm text-error-700">
              <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Upload failed. Please try again.
            </div>
          )}
        </div>
      )}

      {/* Appeal modal */}
      {onAppeal && (
        <AppealModal
          open={appealOpen}
          onClose={() => setAppealOpen(false)}
          onSubmit={onAppeal}
          photoThumbUrl={displayUrl ?? undefined}
        />
      )}
    </div>
  );
}
