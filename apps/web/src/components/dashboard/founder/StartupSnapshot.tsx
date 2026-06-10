import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface SnapshotKpi {
  label: string;
  value: string | number;
  delta?: number;
  unit?: string;
  fallback?: boolean;
}

export interface StartupSnapshotProps {
  kpis?: SnapshotKpi[];
  loading?: boolean;
}

const DEFAULT_KPIS: SnapshotKpi[] = [
  { label: 'Active Hires', value: '—', fallback: true },
  { label: 'Candidates', value: '—', fallback: true },
  { label: 'Investor Matches', value: '—', fallback: true },
  { label: 'Pipeline Score', value: '—', unit: '%', fallback: true },
];

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp className="h-3 w-3" aria-hidden="true" />;
  if (delta < 0) return <TrendingDown className="h-3 w-3" aria-hidden="true" />;
  return <Minus className="h-3 w-3" aria-hidden="true" />;
}

export function StartupSnapshot({ kpis = DEFAULT_KPIS, loading = false }: StartupSnapshotProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse">
            <div className="h-3 w-20 bg-neutral-100 rounded mb-2" />
            <div className="h-7 w-12 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Startup snapshot"
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {kpis.map((kpi, i) => (
        <div
          key={`${kpi.label}-${i}`}
          className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4"
        >
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
            {kpi.label}
          </p>
          <div className="flex items-end gap-2">
            <span
              className={cn(
                'text-2xl font-bold',
                kpi.fallback ? 'text-neutral-300' : 'text-neutral-900',
              )}
            >
              {kpi.fallback ? '—' : `${kpi.value}${kpi.unit ?? ''}`}
            </span>
            {!kpi.fallback && kpi.delta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full mb-0.5',
                  kpi.delta > 0
                    ? 'bg-success-100 text-success-700'
                    : kpi.delta < 0
                    ? 'bg-error-100 text-error-600'
                    : 'bg-neutral-100 text-neutral-500',
                )}
                aria-label={`${kpi.delta > 0 ? '+' : ''}${kpi.delta} change`}
              >
                <DeltaIcon delta={kpi.delta} />
                {kpi.delta !== 0 && `${kpi.delta > 0 ? '+' : ''}${kpi.delta}`}
              </span>
            )}
          </div>
          {kpi.fallback && (
            <p className="text-xs text-neutral-400 mt-0.5">No data yet</p>
          )}
        </div>
      ))}
    </div>
  );
}
