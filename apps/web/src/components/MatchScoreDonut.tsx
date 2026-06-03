'use client';

import { useEffect, useRef } from 'react';

type DonutSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<DonutSize, { outer: number; stroke: number; fontSize: string }> = {
  sm: { outer: 36, stroke: 3, fontSize: 'text-2xs' },
  md: { outer: 56, stroke: 4, fontSize: 'text-xs' },
  lg: { outer: 80, stroke: 5, fontSize: 'text-sm' },
};

interface MatchScoreDonutProps {
  score: number;
  size?: DonutSize;
  animate?: boolean;
  className?: string;
}

export function MatchScoreDonut({ score, size = 'md', animate = true, className = '' }: MatchScoreDonutProps) {
  const { outer, stroke, fontSize } = SIZE_MAP[size];
  const radius = (outer - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (score / 100);
  const offset = circumference - filled;
  const innerSize = outer - stroke * 4;
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 1s ease-out';
        circleRef.current.style.strokeDashoffset = String(offset);
      }
    });
  }, [score, circumference, offset, animate]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: outer, height: outer }}
      role="img"
      aria-label={`${score}% match score`}
    >
      <svg
        width={outer}
        height={outer}
        viewBox={`0 0 ${outer} ${outer}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={stroke}
        />
        {/* Fill */}
        <circle
          ref={circleRef}
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="#4F46E5"
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={animate ? circumference : offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Inner white circle + text */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          margin: stroke * 2,
          borderRadius: '50%',
          background: 'white',
        }}
      >
        <span className={`${fontSize} font-bold text-primary-600 leading-none`}>{score}</span>
        {size !== 'sm' && <span className="text-2xs text-neutral-400 leading-none mt-0.5">%</span>}
      </div>
    </div>
  );
}
