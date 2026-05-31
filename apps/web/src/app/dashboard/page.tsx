import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/sign-in');

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name ?? session.user.email}</p>
      <p>Role: <strong>{session.user.role}</strong></p>
      <p>Region: <strong>{session.user.region}</strong></p>
    </main>
  );
}
