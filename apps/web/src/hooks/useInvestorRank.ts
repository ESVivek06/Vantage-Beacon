'use client';

import { useState, useEffect } from 'react';
import type { RankedInvestor } from '@/app/api/investors/ranked/route';

export type UseInvestorRankState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; investors: RankedInvestor[]; recencyFallback: boolean; calloutSuppressed: boolean };

export function useInvestorRank(): UseInvestorRankState {
  const [state, setState] = useState<UseInvestorRankState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/investors/ranked')
      .then(async (res) => {
        if (res.status === 403) {
          // Not a founder — suppress silently
          setState({
            status: 'ready',
            investors: [],
            recencyFallback: false,
            calloutSuppressed: true,
          });
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{
          investors: RankedInvestor[];
          count: number;
          recencyFallback: boolean;
          calloutSuppressed: boolean;
        }>;
      })
      .then((data) => {
        if (!data || cancelled) return;
        setState({
          status: 'ready',
          investors: data.investors,
          recencyFallback: data.recencyFallback,
          calloutSuppressed: data.calloutSuppressed,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: 'error', error: String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
