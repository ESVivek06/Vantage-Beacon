'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InvitePage() {
  const router = useRouter();
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (code) {
      sessionStorage.setItem('vb_referral_code', code);
    }
    router.replace('/join/role');
  }, [code, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <p className="text-md text-neutral-500">Redirecting…</p>
    </div>
  );
}
