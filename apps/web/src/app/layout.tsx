import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { CookieConsent } from '../components/CookieConsent';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'V.B',
  description: 'V.B Platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
          <CookieConsent />
        </SessionProvider>
      </body>
    </html>
  );
}
