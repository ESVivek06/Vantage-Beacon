'use client';

import { useEffect, useRef } from 'react';

interface ProfileRingProps {
  percent: number;
  label?: string;
}

// r=28 → circumference = 2π*28 ≈ 175.9 (per spec)
const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 175.93

export function ProfileRing({ percent, label }: ProfileRingProps) {
  const outer = 72;
  const stroke = outer / 2 - RADIUS; // = 8
  const dashoffset = (1 - percent / 100) * CIRCUMFERENCE;
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
    requestAnimationFrame(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 0.8s ease-out';
        circleRef.current.style.strokeDashoffset = String(dashoffset);
      }
    });
  }, [percent, dashoffset]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: outer, height: outer }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Profile ${percent}% complete`}
    >
      <svg
        width={outer}
        height={outer}
        viewBox={`0 0 ${outer} ${outer}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={RADIUS}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        <circle
          ref={circleRef}
          cx={outer / 2}
          cy={outer / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-success-500)"
          strokeWidth={stroke}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold leading-none text-success-600">
          {percent}%
        </span>
        <span className="text-2xs text-neutral-500 mt-0.5">done</span>
      </div>
    </div>
  );
}
