'use client';

import Script from 'next/script';

const COOKIEBOT_ID = process.env.NEXT_PUBLIC_COOKIEBOT_ID ?? '';

/**
 * Injects the Cookiebot CMP script via Next.js Script with afterInteractive strategy
 * so it does not block the page render.
 *
 * Cookiebot automatically intercepts analytics tags and surfaces the consent banner
 * to UK/EU users; no further configuration is required here beyond setting
 * NEXT_PUBLIC_COOKIEBOT_ID in your environment.
 *
 * Include this component in the root layout so consent is captured on every page.
 */
export function CookieConsent() {
  if (!COOKIEBOT_ID) {
    return null;
  }

  return (
    <Script
      id="cookiebot"
      src="https://consent.cookiebot.com/uc.js"
      data-cbid={COOKIEBOT_ID}
      data-blockingmode="auto"
      strategy="afterInteractive"
    />
  );
}
