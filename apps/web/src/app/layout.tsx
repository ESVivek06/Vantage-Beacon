import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { CookieConsent } from '../components/CookieConsent';
import { PwaRegistrar } from '../components/PwaRegistrar';
import { auth } from '@/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'V.B — Business Platform',
  description: 'Connect freelancers, founders, investors, suppliers, and stakeholders across UK, India, and North America.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'V.B',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="antialiased">
        <SessionProvider session={session}>
          {children}
          <CookieConsent />
          <PwaRegistrar />
        </SessionProvider>
      </body>
    </html>
  );
}
