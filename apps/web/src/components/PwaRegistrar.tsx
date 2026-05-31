'use client';

import { useEffect } from 'react';

export function PwaRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration is best-effort; don't throw
      });
    }
  }, []);

  return null;
}
