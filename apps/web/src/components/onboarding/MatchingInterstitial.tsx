'use client';

import { useEffect, useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';

const MESSAGES = [
  'Scanning 10,000+ members in your region',
  'Analysing skills and goals alignment',
  'Calculating compatibility scores',
  'Curating your top results',
];

interface MatchingInterstitialProps {
  onComplete: () => void;
  minDelay?: number;
}

export function MatchingInterstitial({ onComplete, minDelay = 3000 }: MatchingInterstitialProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [showFootnote, setShowFootnote] = useState(false);
  const [showLong, setShowLong] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1500);
    const footnoteT = setTimeout(() => setShowFootnote(true), 3000);
    const longT = setTimeout(() => setShowLong(true), 15000);
    const doneT = setTimeout(() => onComplete(), Math.max(minDelay, 4000));
    return () => {
      clearInterval(iv);
      clearTimeout(footnoteT);
      clearTimeout(longT);
      clearTimeout(doneT);
    };
  }, [onComplete, minDelay]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center min-h-dvh px-8 py-16"
      style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 50%, #134E4A 100%)' }}
      aria-busy="true"
    >
      {/* Logo */}
      <div className="mb-12 text-white text-3xl font-bold tracking-tight">V.B</div>

      {/* Pulsing orb */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute h-[120px] w-[120px] rounded-full bg-primary-400 opacity-15 animate-pc-pulse" />
        <div className="absolute h-[80px] w-[80px] rounded-full bg-primary-300 opacity-30 animate-pc-pulse-d1" />
        <div className="relative h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center animate-pc-pulse-d2">
          <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-display-sm font-semibold text-white text-center mb-4">
        Finding your first matches…
      </h1>

      {/* Rotating message */}
      <div role="status" className="mb-6 h-6">
        <p className="text-md text-neutral-300 text-center transition-opacity duration-500">
          {MESSAGES[msgIndex]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-60 md:w-60 h-[3px] bg-primary-800 rounded-full overflow-hidden mb-8">
        <div
          className="h-full rounded-full animate-bar-fill"
          style={{ background: 'linear-gradient(90deg, #2DD4BF, #818CF8)', width: '0%' }}
        />
      </div>

      {/* Footnote */}
      {showFootnote && (
        <p className="text-xs text-neutral-400 text-center transition-opacity duration-500">
          {showLong ? 'Still working, almost done…' : 'This usually takes under 10 seconds'}
        </p>
      )}
    </div>
  );
}
