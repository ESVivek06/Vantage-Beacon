import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          Now in Beta
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-primary mb-4">
          V.<span className="text-accent">B</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
          The business platform connecting freelancers, founders, investors, and stakeholders across the UK, India, and North America.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          AI-powered matching · Multi-region support · End-to-end collaboration tools
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">Get started free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
