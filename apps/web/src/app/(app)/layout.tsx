import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navigation } from '@/components/Navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/auth/sign-in');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation user={session.user} />
      {/* Desktop: padding-top 64px for top nav; Mobile: 56px top + 56px bottom */}
      <main className="pt-14 md:pt-16 pb-14 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
