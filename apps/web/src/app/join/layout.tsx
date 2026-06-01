import Link from 'next/link';

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-neutral-0">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
          <Link href="/" className="text-display-sm font-bold text-primary-600">V.B</Link>
          <Link href="/auth/sign-in" className="text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
