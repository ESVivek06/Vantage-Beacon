'use client';

import { useState, useEffect } from 'react';
import type { MatchScoreItem } from '@/app/api/matches/route';

export type UseMatchScoresState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'model-cold' }
  | { status: 'ready'; matches: MatchScoreItem[]; featuredMatch: MatchScoreItem | null };

export function useMatchScores(): UseMatchScoresState {
  const [state, setState] = useState<UseMatchScoresState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/matches?role=freelancer')
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
        if (data.modelCold || data.count === 0) {
          setState({ status: 'model-cold' });
          return;
        }

        // Filter: hide scores below 50%
        const visible = data.matches.filter((m) => m.score >= 0.5);
        // Featured: first match with isFeatured, fallback to first unread (isNew)
        const featured =
          visible.find((m) => m.isFeatured) ??
          visible.find((m) => m.isNew) ??
          null;

        setState({ status: 'ready', matches: visible, featuredMatch: featured });
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
