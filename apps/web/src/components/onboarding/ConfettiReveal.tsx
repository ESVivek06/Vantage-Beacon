'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  duration: number;
}

const COLORS = ['#818CF8', '#2DD4BF', '#FBBF24', '#4F46E5', '#14B8A6', '#F59E0B'];

export function ConfettiReveal({ count = 60 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 1.2,
        size: 6 + Math.random() * 6,
        duration: 1.2 + Math.random() * 0.8,
      })),
    );
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-50"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `pc-fall ${p.duration}s ease-in forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
