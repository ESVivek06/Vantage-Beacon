'use client';

import { useRouter } from 'next/navigation';
import { MatchingInterstitial } from '@/components/onboarding/MatchingInterstitial';

export default function OnboardingMatchingPage() {
  const router = useRouter();

  function handleComplete() {
    router.push('/onboarding/match-reveal');
  }

  return <MatchingInterstitial onComplete={handleComplete} minDelay={3000} />;
}
