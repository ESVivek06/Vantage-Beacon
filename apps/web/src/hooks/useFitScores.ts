'use client';

import { useState, useEffect } from 'react';
import type { MatchScoreItem } from '@/app/api/matches/route';

export interface FitScoreItem extends MatchScoreItem {
  fitScore: number;
}

export type UseFitScoresState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'model-cold' }
  | { status: 'ready'; candidates: FitScoreItem[] };

export function useFitScores(): UseFitScoresState {
  const [state, setState] = useState<UseFitScoresState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/matches?role=founder')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{
          matches: MatchScoreItem[];
          count: number;
          modelCold: boolean;
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        if (data.modelCold) {
          setState({ status: 'model-cold' });
          return;
        }

        const candidates: FitScoreItem[] = data.matches.map((m) => ({
          ...m,
          // fitScore combines embedding score with skill overlap ratio
          fitScore: m.score * 0.7 + ((m.explainability.skillOverlap?.length ?? 0) / 10) * 0.3,
        }));

        setState({ status: 'ready', candidates });
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
