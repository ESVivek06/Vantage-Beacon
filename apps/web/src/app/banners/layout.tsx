import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'V.B — Marketing Assets',
  robots: 'noindex,nofollow',
};

export default function BannersLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #0f172a; display: flex; align-items: flex-start; justify-content: flex-start; }
        `}</style>
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
