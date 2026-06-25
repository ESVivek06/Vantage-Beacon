import { cn } from '@/lib/utils';

interface RekognitionScoreBarProps {
  score: number; // 0–100
  label?: string;
  className?: string;
}

function scoreColor(score: number) {
  if (score >= 80) return { bar: 'bg-error-500', text: 'text-error-700' };
  if (score >= 50) return { bar: 'bg-warning-500', text: 'text-warning-700' };
  return { bar: 'bg-success-500', text: 'text-success-700' };
}

export function RekognitionScoreBar({ score, label, className }: RekognitionScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const colors = scoreColor(clamped);

  return (
    <div className={cn('w-full min-w-[80px]', className)} aria-label={`Rekognition confidence: ${clamped}%`}>
      <div className="flex items-center justify-between mb-0.5">
        {label && (
          <span className="text-2xs text-neutral-500 truncate mr-1">{label}</span>
        )}
        <span className={cn('text-2xs font-semibold ml-auto shrink-0', colors.text)}>
          {clamped}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', colors.bar)}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
