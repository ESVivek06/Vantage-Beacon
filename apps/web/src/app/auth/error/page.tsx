'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <main className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-error-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-error-600" />
              </div>
              <CardTitle>Authentication error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-500">{message}</p>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/auth/sign-in">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
