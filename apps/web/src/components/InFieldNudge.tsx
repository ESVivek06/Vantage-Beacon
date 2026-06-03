import { Sparkles } from 'lucide-react';

interface InFieldNudgeProps {
  className?: string;
}

export function InFieldNudge({ className = '' }: InFieldNudgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-neutral-500 ${className}`}>
      <Sparkles className="h-3 w-3 text-secondary-500" aria-hidden="true" />
      Adding this improves your match quality
    </span>
  );
}
