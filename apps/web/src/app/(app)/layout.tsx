import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navigation } from '@/components/Navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/auth/sign-in');

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={session.user} />
      <main className="md:pl-56 pt-14 md:pt-0 pb-16 md:pb-0">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}
