'use client';

import { useSearchParams } from 'next/navigation';

const MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign-in link is no longer valid.',
  Default: 'An error occurred during authentication.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') ?? 'Default';
  const message = MESSAGES[error] ?? MESSAGES.Default;

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1>Authentication error</h1>
      <p>{message}</p>
      <a href="/auth/sign-in">Back to sign in</a>
    </main>
  );
}
