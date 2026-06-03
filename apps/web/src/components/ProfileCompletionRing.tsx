'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

type RingSize = 'sm' | 'lg';

function ringColor(pct: number): string {
  if (pct < 40) return '#EF4444';
  if (pct < 65) return '#F59E0B';
  if (pct < 80) return '#14B8A6';
  return '#22C55E';
}

interface ProfileCompletionRingProps {
  percent: number;
  stepsLeft?: number;
  size?: RingSize;
  href?: string;
}

export function ProfileCompletionRing({
  percent,
  stepsLeft,
  size = 'lg',
  href = '/profile/edit',
}: ProfileCompletionRingProps) {
  const outer = size === 'lg' ? 64 : 36;
  const stroke = size === 'lg' ? 5 : 3;
  const radius = (outer - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (percent / 100);
  const offset = circumference - filled;
  const color = ringColor(percent);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 0.8s ease-out';
        circleRef.current.style.strokeDashoffset = String(offset);
      }
    });
  }, [percent, circumference, offset]);

  const ring = (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: outer, height: outer }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile ${percent}% complete`}
      >
        <svg
          width={outer}
          height={outer}
          viewBox={`0 0 ${outer} ${outer}`}
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          <circle cx={outer / 2} cy={outer / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
          <circle
            ref={circleRef}
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={[size === 'lg' ? 'text-sm font-bold' : 'text-2xs font-bold'].join('')}
            style={{ color }}
          >
            {percent}%
          </span>
          {size === 'lg' && <span className="text-2xs text-neutral-500">complete</span>}
        </div>
      </div>

      {size === 'lg' && stepsLeft !== undefined && (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-medium text-neutral-600">{stepsLeft} steps left</span>
          {href && (
            <Link href={href} className="text-xs text-primary-600 hover:underline">
              Complete now →
            </Link>
          )}
        </div>
      )}
    </div>
  );

  if (size === 'sm') {
    return (
      <div title={`${percent}% complete — tap to finish`}>
        {ring}
      </div>
    );
  }

  return ring;
}
