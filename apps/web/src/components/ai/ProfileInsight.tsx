'use client';

import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

interface ProfileInsightData {
  completionBucket: string;
  medianCtr: number | null;
  sampleSize: number;
  insight: string | null;
  insufficientSample: boolean;
}

interface ProfileInsightProps {
  profileCompletion: number;
  className?: string;
}

const MIN_SAMPLE_SIZE = 5;

function getCompletionBucket(pct: number): string {
  if (pct >= 90) return '90-100';
  if (pct >= 70) return '70-89';
  if (pct >= 50) return '50-69';
  return '<50';
}

function buildInsightText(bucket: string, ctr: number | null): string | null {
  if (ctr === null) return null;
  const pct = Math.round(ctr * 100);
  const bucketLabel: Record<string, string> = {
    '90-100': 'fully complete',
    '70-89': '70–89% complete',
    '50-69': '50–69% complete',
    '<50': 'under 50% complete',
  };
  return `Profiles ${bucketLabel[bucket] ?? bucket} get ~${pct}% CTR on average.`;
}

/**
 * Profile Insight component — shows median CTR by profile completion bucket.
 * Omitted entirely when sample size is insufficient.
 *
 * Note: CTR here is derived from connection acceptance rate as a proxy
 * (no dedicated view-tracking table exists yet).
 */
export function ProfileInsight({ profileCompletion, className = '' }: ProfileInsightProps) {
  const [data, setData] = useState<ProfileInsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Derive insight from match feedback acceptance rate as CTR proxy
    fetch('/api/matches?role=freelancer&limit=100')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{
          matches: Array<{ score: number }>;
          count: number;
          modelCold: boolean;
        }>;
      })
      .then((response) => {
        if (cancelled) return;
        const bucket = getCompletionBucket(profileCompletion);

        if (response.modelCold || response.count < MIN_SAMPLE_SIZE) {
          setData({
            completionBucket: bucket,
            medianCtr: null,
            sampleSize: response.count,
            insight: null,
            insufficientSample: true,
          });
          return;
        }

        // Approximate CTR: fraction of matches with score >= 0.6 (proxy for high engagement)
        const engaged = response.matches.filter((m) => m.score >= 0.6).length;
        const medianCtr = response.count > 0 ? engaged / response.count : null;
        const insight = buildInsightText(bucket, medianCtr);

        setData({
          completionBucket: bucket,
          medianCtr,
          sampleSize: response.count,
          insight,
          insufficientSample: response.count < MIN_SAMPLE_SIZE,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profileCompletion]);

  // Omit during loading
  if (loading) return null;

  // Omit if insufficient sample or no data
  if (!data || data.insufficientSample) return null;

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg bg-neutral-50 border border-neutral-200 ${className}`}
      role="note"
      aria-label="Profile insight"
    >
      <BarChart3 className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-neutral-600 leading-relaxed">
        {data.insight}
        {data.medianCtr !== null && (
          <span className="block mt-0.5 text-neutral-400">
            Based on {data.sampleSize} profiles in your completion range.
          </span>
        )}
      </p>
    </div>
  );
}
