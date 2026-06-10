import { initials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DollarSign } from 'lucide-react';

export interface InvestorItemProps {
  id: string;
  name: string;
  firm?: string;
  fundStage?: string;
  checkSize?: string;
  rank?: number;
  rankFallback?: boolean;
}

export function InvestorItem({
  name,
  firm,
  fundStage,
  checkSize,
  rank,
  rankFallback,
}: InvestorItemProps) {
  return (
    <li className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 shadow-xs p-4 hover:shadow-md transition-all duration-normal">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="text-sm bg-amber-100 text-amber-700 font-semibold">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate">{name}</p>
        {firm && <p className="text-xs text-neutral-500 truncate">{firm}</p>}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {fundStage && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: '#FEF3C7', color: '#92400E' }}
          >
            {fundStage}
          </span>
        )}
        {checkSize && (
          <span className="text-xs text-neutral-500 flex items-center gap-0.5">
            <DollarSign className="h-3 w-3" aria-hidden="true" />
            {checkSize}
          </span>
        )}
        {rankFallback ? (
          <span className="text-xs text-neutral-400">Rank pending</span>
        ) : rank !== undefined ? (
          <span
            className="text-xs font-bold text-amber-600"
            aria-label={`AI investor rank: #${rank}`}
          >
            #{rank}
          </span>
        ) : null}
      </div>
    </li>
  );
}
