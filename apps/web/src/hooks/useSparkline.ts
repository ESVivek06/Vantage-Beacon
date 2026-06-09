'use client';

import { useState, useEffect } from 'react';
import type { SparklinePoint } from '@/app/api/analytics/sparkline/route';

export type UseSparklineState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'insufficient-sample' }
  | { status: 'ready'; data: SparklinePoint[]; days: number };

export function useSparkline(role: 'freelancer' | 'founder', days = 14): UseSparklineState {
  const [state, setState] = useState<UseSparklineState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetch(`/api/analytics/sparkline?days=${days}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{
          role: string;
          days: number;
          data: SparklinePoint[];
          insufficientSample: boolean;
        }>;
      })
      .then((response) => {
        if (cancelled) return;
        if (response.insufficientSample) {
          setState({ status: 'insufficient-sample' });
          return;
        }
        setState({ status: 'ready', data: response.data, days: response.days });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: 'error', error: String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [role, days]);

  return state;
}
